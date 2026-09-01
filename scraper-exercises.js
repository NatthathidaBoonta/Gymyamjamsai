/**
 * Exercise Scraper — ดึงท่า + GIFs จาก fitnessonline.app/th/
 *
 * ใช้ Puppeteer เพื่อ:
 * 1. เข้าเว็บ
 * 2. รอให้ exercise load เสร็จ
 * 3. ดึง exercise data (ชื่อ, หมวดหมู่, URL)
 * 4. ดาวน์โหลด GIF/Video
 * 5. สร้าง SQL insert statements
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const EXERCISES_DIR = path.join(__dirname, 'frontend/public/exercises');

// สร้างโฟลเดอร์ถ้ายังไม่มี
if (!fs.existsSync(EXERCISES_DIR)) {
  fs.mkdirSync(EXERCISES_DIR, { recursive: true });
}

async function downloadFile(url, filename) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const filepath = path.join(EXERCISES_DIR, filename);

    // ข้ามถ้าไฟล์มีแล้ว
    if (fs.existsSync(filepath)) {
      console.log(`✅ ${filename} มีแล้ว`);
      resolve(filepath);
      return;
    }

    const file = fs.createWriteStream(filepath);
    protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        downloadFile(response.headers.location, filename).then(resolve).catch(reject);
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`⬇️  ดาวน์โหลด: ${filename}`);
        resolve(filepath);
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {}); // ลบไฟล์ที่ผิดพลาด
      reject(err);
    });
  });
}

async function scrapeExercises() {
  console.log('🚀 เริ่มดึงท่าออกกำลังกาย...\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    // ตั้ง user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

    console.log('📍 โหลดเว็บ...');
    await page.goto('https://fitnessonline.app/th/', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    console.log('⏳ รอให้ exercises โหลด...');

    // รอให้ exercise elements โหลด
    await page.waitForFunction(
      () => document.querySelectorAll('[class*="exercise"], video source').length > 0,
      { timeout: 20000 }
    );

    // Scroll เพื่อให้โหลดเพิ่มเติม
    await page.evaluate(() => {
      window.scrollBy(0, window.innerHeight);
    });

    await new Promise(resolve => setTimeout(resolve, 3000));

    // ดึง exercise data
    console.log('🔍 กำลังดึงข้อมูล...');
    const exercises = await page.evaluate(() => {
      const results = [];

      // วิธี 1: ดึงจาก video tags
      document.querySelectorAll('video').forEach((video, idx) => {
        const source = video.querySelector('source');
        if (source) {
          const name = video.closest('[class*="exercise"], [data-exercise]')?.textContent?.trim()
            || `Exercise ${idx + 1}`;

          results.push({
            name: name.split('\n')[0] || `Exercise ${idx + 1}`,
            url: source.src || source.getAttribute('src'),
            type: 'video'
          });
        }
      });

      // วิธี 2: ดึงจาก img tags ที่เป็น GIF
      document.querySelectorAll('img[src*=".gif"], img[src*="exercise"]').forEach((img, idx) => {
        const name = img.closest('[class*="exercise"]')?.textContent?.trim()
          || img.alt
          || `Exercise ${idx + 1}`;

        if (!results.find(r => r.name === name.split('\n')[0])) {
          results.push({
            name: name.split('\n')[0] || `Exercise ${idx + 1}`,
            url: img.src,
            type: 'image'
          });
        }
      });

      // วิธี 3: ดึงจาก data attributes
      document.querySelectorAll('[data-video], [data-exercise]').forEach((el) => {
        const name = el.textContent?.trim() || el.getAttribute('data-exercise') || `Exercise`;
        const url = el.getAttribute('data-video') || el.querySelector('source')?.src;

        if (url && !results.find(r => r.url === url)) {
          results.push({
            name: name.split('\n')[0] || `Exercise`,
            url: url,
            type: url.includes('.gif') ? 'image' : 'video'
          });
        }
      });

      return results.filter(r => r.url && r.url.length > 0);
    });

    console.log(`\n✅ พบ ${exercises.length} ท่า\n`);

    if (exercises.length === 0) {
      console.log('⚠️  ไม่พบท่า - เว็บอาจมีการป้องกัน');
      console.log('💡 ลองดาวน์โหลดจาก CDN โดยตรง...\n');

      // ลองดึง URLs จาก page source
      const pageContent = await page.content();
      const cdnUrls = pageContent.match(/https:\/\/cdn\.fitnessonline\.app[^"<]*(\.gif|\.mp4)/g) || [];

      for (const url of [...new Set(cdnUrls)].slice(0, 50)) {
        const filename = url.split('/').pop();
        exercises.push({
          name: filename.replace(/\.(gif|mp4)$/, '').replace(/-/g, ' '),
          url: url,
          type: url.includes('.gif') ? 'image' : 'video'
        });
      }
    }

    // ดาวน์โหลด GIFs/Videos
    console.log(`📥 ดาวน์โหลด ${exercises.length} ไฟล์...\n`);

    const downloaded = [];
    for (const exercise of exercises) {
      try {
        const ext = exercise.type === 'video' ? '.mp4' : '.gif';
        const filename = `${exercise.name.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}${ext}`.replace(/--+/g, '-');

        await downloadFile(exercise.url, filename);
        downloaded.push({
          name: exercise.name,
          filename: filename,
          url: exercise.url
        });
      } catch (err) {
        console.log(`❌ ข้อผิดพลาด ${exercise.name}: ${err.message}`);
      }
    }

    console.log(`\n✅ ดาวน์โหลดเสร็จ! (${downloaded.length}/${exercises.length})\n`);

    // สร้าง SQL
    console.log('📋 สร้าง SQL Insert...\n');
    let sql = '-- Exercises from fitnessonline.app\n';
    sql += 'INSERT INTO exercises (id, name, category, media_url, instructions) VALUES\n';

    downloaded.forEach((ex, idx) => {
      const id = `imported${idx + 1}`;
      const category = classifyExercise(ex.name);
      const instructions = `แบบฝึกหัด: ${ex.name}\n\nดูวิดีโอตัวอย่างสำหรับคำแนะนำทีละขั้นตอน`;

      sql += `('${id}', '${ex.name.replace(/'/g, "''")}', '${category}', '/exercises/${ex.filename}', '${instructions.replace(/'/g, "''")}')`;
      sql += idx < downloaded.length - 1 ? ',\n' : ';\n';
    });

    // บันทึก SQL
    const sqlFile = path.join(__dirname, 'mysql/init/05-fitnessonline-exercises.sql');
    fs.writeFileSync(sqlFile, sql);
    console.log(`✅ SQL saved: ${sqlFile}`);
    console.log(`\n📊 สรุป:`);
    console.log(`   ดาวน์โหลด: ${downloaded.length} ไฟล์`);
    console.log(`   SQL: ${downloaded.length} records`);
    console.log(`\n🎯 ขั้นตอนถัดไป:`);
    console.log(`   1. docker-compose down -v`);
    console.log(`   2. docker-compose up -d mysql`);
    console.log(`   3. ตรวจสอบท่าใหม่ในระบบ`);

  } catch (err) {
    console.error('❌ เกิดข้อผิดพลาด:', err);
  } finally {
    await browser.close();
  }
}

function classifyExercise(name) {
  name = name.toLowerCase();

  if (name.match(/run|jump|cardio|hiit|sprint|cycle|row|climb/)) return 'cardio';
  if (name.match(/stretch|yoga|flexibility|foam/)) return 'flexibility';
  return 'strength';
}

// รัน
scrapeExercises().catch(console.error);
