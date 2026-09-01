/**
 * LiftManual Scraper — ดึงท่าและรูปจาก liftmanual.com/strength/
 *
 * ใช้ Puppeteer เพื่อ:
 * 1. โหลด https://liftmanual.com/strength/
 * 2. ดึง 20+ exercises ต่อ category
 * 3. ดาวน์โหลด GIF/Images
 * 4. สร้าง SQL INSERT statements
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const EXERCISES_DIR = path.join(__dirname, 'frontend/public/exercises');

if (!fs.existsSync(EXERCISES_DIR)) {
  fs.mkdirSync(EXERCISES_DIR, { recursive: true });
}

async function downloadFile(url, filename) {
  return new Promise((resolve, reject) => {
    if (!url) {
      reject(new Error('URL is empty'));
      return;
    }

    const protocol = url.startsWith('https') ? https : http;
    const filepath = path.join(EXERCISES_DIR, filename);

    if (fs.existsSync(filepath)) {
      console.log(`✅ ${filename} มีแล้ว`);
      resolve(filepath);
      return;
    }

    const file = fs.createWriteStream(filepath);
    protocol.get(url, { timeout: 10000 }, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        downloadFile(response.headers.location, filename).then(resolve).catch(reject);
        return;
      }
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`⬇️  ดาวน์โหลด: ${filename}`);
        resolve(filepath);
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

async function scrapeExercises() {
  console.log('🚀 เริ่มดึงท่าจาก LiftManual...\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

    console.log('📍 โหลดเว็บ: https://liftmanual.com/strength/');
    await page.goto('https://liftmanual.com/strength/', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    console.log('⏳ รอให้ exercises โหลด...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // ดึง exercise data
    console.log('🔍 กำลังดึงข้อมูล...');
    const exercises = await page.evaluate(() => {
      const results = [];
      const seen = new Set();

      // ดึงจาก article tags
      document.querySelectorAll('article, [class*="exercise"], [class*="card"], [class*="movement"]').forEach((el) => {
        const titleEl = el.querySelector('h1, h2, h3, .title, [class*="name"]');
        const imgEl = el.querySelector('img, picture img, figure img');
        const linkEl = el.querySelector('a[href*="exercise"], a[href]');

        if (titleEl) {
          const name = titleEl.textContent?.trim();
          const imgSrc = imgEl?.src || imgEl?.dataset?.src;
          const url = linkEl?.href;

          if (name && !seen.has(name)) {
            seen.add(name);
            results.push({
              name: name.split('\n')[0],
              imgUrl: imgSrc || url,
              url: url || imgSrc,
              type: imgSrc?.includes('.gif') ? 'image' : 'image'
            });
          }
        }
      });

      // ดึงจาก links ที่เป็น exercises
      document.querySelectorAll('a[href*="exercise"], a[href*="movement"], a[href*="strength"]').forEach((link) => {
        const name = link.textContent?.trim();
        if (name && name.length > 2 && name.length < 100 && !seen.has(name)) {
          const img = link.querySelector('img');
          seen.add(name);
          results.push({
            name: name.split('\n')[0],
            url: link.href,
            imgUrl: img?.src,
            type: 'link'
          });
        }
      });

      return results.filter(r => r.name && r.name.length > 0);
    });

    console.log(`✅ พบ ${exercises.length} ท่า\n`);

    if (exercises.length === 0) {
      console.log('⚠️  ไม่พบท่า - ลองเปิด developer tools และตรวจสอบ');
    }

    // ดาวน์โหลดรูปภาพ
    console.log(`📥 ดาวน์โหลด ${Math.min(exercises.length, 100)} รูปภาพ...\n`);

    const downloaded = [];
    const categoriesToFetch = ['strength', 'cardio', 'flexibility'];
    let count = 0;

    for (const exercise of exercises.slice(0, 100)) {
      if (count >= 60) break;

      try {
        let mediaUrl = exercise.imgUrl || exercise.url;

        if (!mediaUrl || mediaUrl.length === 0) {
          continue;
        }

        // สำหรับ links ที่ไม่มี image, ดึง image จากหน้า
        if (exercise.type === 'link' && (!exercise.imgUrl || exercise.imgUrl.length === 0)) {
          try {
            await page.goto(exercise.url, { waitUntil: 'networkidle2', timeout: 15000 });
            mediaUrl = await page.evaluate(() => {
              const img = document.querySelector('img[alt*="exercise"], img[class*="exercise"], img');
              return img?.src || img?.dataset?.src || null;
            });

            if (!mediaUrl) continue;
          } catch (err) {
            console.log(`⏭️  ข้ามเว็บ ${exercise.url} (ไม่พบรูป)`);
            continue;
          }
        }

        // คำนวณ category
        const category = classifyExercise(exercise.name);

        const ext = mediaUrl.includes('.gif') ? '.gif' : '.jpg';
        const filename = `${exercise.name.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}${ext}`.replace(/--+/g, '-').substring(0, 100);

        await downloadFile(mediaUrl, filename);

        downloaded.push({
          name: exercise.name,
          filename: filename,
          category: category
        });

        count++;
      } catch (err) {
        console.log(`❌ ข้อผิดพลาด ${exercise.name}: ${err.message}`);
      }
    }

    console.log(`\n✅ ดาวน์โหลดเสร็จ! (${downloaded.length}/60)\n`);

    // จัดกลุ่มตามหมวดหมู่
    const byCategory = {};
    downloaded.forEach(ex => {
      if (!byCategory[ex.category]) byCategory[ex.category] = [];
      byCategory[ex.category].push(ex);
    });

    console.log('📊 สรุปตามหมวดหมู่:');
    Object.entries(byCategory).forEach(([cat, exercises]) => {
      console.log(`   ${cat}: ${exercises.length} ท่า`);
    });

    // สร้าง SQL
    console.log('\n📋 สร้าง SQL Insert...\n');
    let sql = '-- Exercises from liftmanual.com\n';
    sql += 'INSERT INTO exercises (id, name, category, media_url, instructions) VALUES\n';

    downloaded.forEach((ex, idx) => {
      const id = `liftmanual${idx + 1}`;
      const instructions = `แบบฝึกหัด: ${ex.name}\n\nดูรูปภาพตัวอย่างสำหรับคำแนะนำทีละขั้นตอน`;

      sql += `('${id}', '${ex.name.replace(/'/g, "''")}', '${ex.category}', '/exercises/${ex.filename}', '${instructions.replace(/'/g, "''")}')`;
      sql += idx < downloaded.length - 1 ? ',\n' : ';\n';
    });

    // บันทึก SQL
    const sqlFile = path.join(__dirname, 'mysql/init/06-liftmanual-exercises.sql');
    fs.writeFileSync(sqlFile, sql);
    console.log(`✅ SQL saved: ${sqlFile}`);
    console.log(`\n📊 สรุป:`);
    console.log(`   ดาวน์โหลด: ${downloaded.length} รูปภาพ`);
    console.log(`   SQL: ${downloaded.length} records`);
    console.log(`\n🎯 ขั้นตอนถัดไป:`);
    console.log(`   1. docker-compose down -v`);
    console.log(`   2. docker-compose up -d mysql`);
    console.log(`   3. อัปเดต UI เป็น GymKaK style + สีดำม่วง`);

  } catch (err) {
    console.error('❌ เกิดข้อผิดพลาด:', err);
  } finally {
    await browser.close();
  }
}

function classifyExercise(name) {
  name = name.toLowerCase();

  if (name.match(/run|jump|cardio|hiit|sprint|cycle|row|climb|stair|walk|dance/)) {
    return 'cardio';
  }
  if (name.match(/stretch|yoga|mobility|flexibility|foam|release/)) {
    return 'flexibility';
  }
  return 'strength';
}

scrapeExercises().catch(console.error);
