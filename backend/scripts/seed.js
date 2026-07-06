/**
 * scripts/seed.js
 *
 * Seed Script — สร้าง/อัปเดตข้อมูลผู้ใช้และคลังท่าออกกำลังกายตั้งต้น
 * รันด้วย: npm run seed
 *
 * 📧 Email   : admin@gymyam.com
 * 🔑 Password: admin1234
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const pool = require('../src/database');

const seedUsers = [
  { email: 'admin@gymyam.com', password: 'admin1234', name: 'Admin Gymyam', role: 'admin' },
  { email: 'user@gymyam.com', password: 'user1234', name: 'User Gymyam', role: 'user' },
];

const seedExercises = [
  // ---- Calisthenics (น้ำหนักตัวเอง/บาร์โหน) ----
  { name: 'Bodyweight Squat', targetMuscle: 'ขา', equipment: 'น้ำหนักตัวเอง', category: 'calisthenics', difficulty: 'beginner', mediaUrl: '/exercises/bodyweight-squat.gif', description: 'ยืนแยกขากว้างเท่าไหล่ ย่อตัวลงเหมือนจะนั่งเก้าอี้ เข่าไม่เกินปลายเท้า แล้วดันสะโพกกลับขึ้นมา' },
  { name: 'Push-up', targetMuscle: 'อก', equipment: 'น้ำหนักตัวเอง', category: 'calisthenics', difficulty: 'beginner', mediaUrl: '/exercises/push-up.gif', description: 'วางมือกว้างกว่าหัวไหล่เล็กน้อย ลำตัวตรงเป็นเส้นเดียว ลดตัวลงจนอกเกือบชิดพื้นแล้วดันขึ้น' },
  { name: 'Plank', targetMuscle: 'แกนกลางลำตัว', equipment: 'น้ำหนักตัวเอง', category: 'calisthenics', difficulty: 'beginner', mediaUrl: '/exercises/plank.gif', description: 'ยันตัวด้วยปลายแขนและปลายเท้า ลำตัวตรงเป็นเส้นเดียวจากหัวถึงส้นเท้า เกร็งหน้าท้องค้างไว้' },
  { name: 'Glute Bridge', targetMuscle: 'สะโพก', equipment: 'น้ำหนักตัวเอง', category: 'calisthenics', difficulty: 'beginner', mediaUrl: null, description: 'นอนหงาย ชันเข่า ดันสะโพกขึ้นจนลำตัวเป็นเส้นตรงจากไหล่ถึงเข่า เกร็งสะโพกค้างแล้วลดลง' },
  { name: 'Lunge', targetMuscle: 'ขา', equipment: 'น้ำหนักตัวเอง', category: 'calisthenics', difficulty: 'intermediate', mediaUrl: '/exercises/lunge.gif', description: 'ก้าวขาไปข้างหน้าหนึ่งก้าว ย่อตัวลงจนเข่าหลังเกือบแตะพื้น แล้วดันตัวกลับสู่ท่ายืน สลับข้าง' },
  { name: 'Jump Squat', targetMuscle: 'ขา', equipment: 'น้ำหนักตัวเอง', category: 'calisthenics', difficulty: 'advanced', mediaUrl: '/exercises/jump-squat.jpg', description: 'ย่อตัวเหมือน Squat ปกติ แล้วกระโดดขึ้นสูงสุดแรง ลงพื้นด้วยปลายเท้าแล้วย่อรับแรงกระแทกทันที' },
  { name: 'Dips', targetMuscle: 'อก', equipment: 'บาร์คู่ขนาน', category: 'calisthenics', difficulty: 'intermediate', mediaUrl: '/exercises/dips.gif', description: 'พยุงตัวบนบาร์คู่ขนานด้วยแขนตรง ค่อยๆ ย่อข้อศอกลดตัวลงจนหัวไหล่ต่ำกว่าข้อศอกเล็กน้อย แล้วดันตัวขึ้น' },
  { name: 'Muscle Up', targetMuscle: 'หลัง', equipment: 'บาร์โหน', category: 'calisthenics', difficulty: 'advanced', mediaUrl: '/exercises/muscle-up.gif', description: 'ดึงตัวขึ้นบาร์โหนแบบมีแรงส่ง (explosive pull) แล้วหมุนข้อมือดันตัวขึ้นพ้นบาร์ต่อเนื่องจากการดึง' },
  { name: 'Diamond Push-Up', targetMuscle: 'ไตรเซ็ป', equipment: 'น้ำหนักตัวเอง', category: 'calisthenics', difficulty: 'intermediate', mediaUrl: '/exercises/diamond-push-up.gif', description: 'วางมือชิดกันเป็นรูปสี่เหลี่ยมข้าวหลามตัดใต้หน้าอก แล้วลดตัวลง-ดันขึ้นเหมือน Push-up ปกติ' },
  { name: 'Wide Grip Pull-Up', targetMuscle: 'หลัง', equipment: 'บาร์โหน', category: 'calisthenics', difficulty: 'intermediate', mediaUrl: '/exercises/wide-grip-pull-up.jpg', description: 'จับบาร์แบบมือกว้างกว่าหัวไหล่มาก ดึงตัวขึ้นจนคางพ้นบาร์ เน้นกล้ามเนื้อปีกหลัง' },
  { name: 'Chin-Up', targetMuscle: 'หลัง', equipment: 'บาร์โหน', category: 'calisthenics', difficulty: 'intermediate', mediaUrl: '/exercises/chin-up.gif', description: 'จับบาร์แบบคว่ำมือ (underhand) กว้างเท่าหัวไหล่ ดึงตัวขึ้นจนคางพ้นบาร์' },
  { name: 'Pull-up', targetMuscle: 'หลัง', equipment: 'บาร์โหน', category: 'calisthenics', difficulty: 'advanced', mediaUrl: '/exercises/pull-up.gif', description: 'จับบาร์มือกว้างกว่าหัวไหล่ ดึงตัวขึ้นจนคางพ้นบาร์ แล้วค่อยๆ ลดตัวลงอย่างควบคุม' },
  { name: 'Australian Pull-Up', targetMuscle: 'หลัง', equipment: 'บาร์โหนต่ำ', category: 'calisthenics', difficulty: 'beginner', mediaUrl: '/exercises/australian-pull-up.jpg', description: 'นอนใต้บาร์ต่ำ ตัวเอียงเป็นเส้นตรง จับบาร์แล้วดึงอกขึ้นชิดบาร์ เป็นท่าฝึกก่อนขึ้น Pull-up เต็มรูปแบบ' },
  { name: 'Pistol Squat', targetMuscle: 'ขา', equipment: 'น้ำหนักตัวเอง', category: 'calisthenics', difficulty: 'advanced', mediaUrl: '/exercises/pistol-squat.jpg', description: 'ยืนขาเดียว อีกขายื่นตรงไปข้างหน้า ย่อตัวลงจนก้นเกือบแตะส้นเท้าแล้วดันตัวขึ้นด้วยขาข้างเดียว' },
  { name: 'Bulgarian Split Squat', targetMuscle: 'ขา', equipment: 'น้ำหนักตัวเอง', category: 'calisthenics', difficulty: 'intermediate', mediaUrl: '/exercises/bulgarian-split-squat.gif', description: 'วางปลายเท้าข้างหลังพาดบนที่สูง ย่อขาหน้าลงจนเข่าหลังเกือบแตะพื้น แล้วดันตัวขึ้น' },
  { name: 'Hanging Leg Raise', targetMuscle: 'แกนกลางลำตัว', equipment: 'บาร์โหน', category: 'calisthenics', difficulty: 'intermediate', mediaUrl: '/exercises/hanging-leg-raise.jpg', description: 'ห้อยตัวบนบาร์โหน ยกขาตรงขึ้นจนขนานพื้นหรือสูงกว่า แล้วค่อยๆ ลดลงอย่างควบคุม' },
  { name: 'Dragon Flag', targetMuscle: 'แกนกลางลำตัว', equipment: 'ม้านั่ง', category: 'calisthenics', difficulty: 'advanced', mediaUrl: '/exercises/dragon-flag.gif', description: 'นอนหงายจับขอบม้านั่งเหนือศีรษะ ยกลำตัวและขาขึ้นเป็นเส้นตรงโดยใช้เพียงหัวไหล่เป็นจุดรับน้ำหนัก' },

  // ---- Cardio ----
  { name: 'Mountain Climber', targetMuscle: 'แกนกลางลำตัว', equipment: 'น้ำหนักตัวเอง', category: 'cardio', difficulty: 'intermediate', mediaUrl: '/exercises/mountain-climber.png', description: 'อยู่ในท่า Plank สลับดึงเข่าเข้าหาอกทีละข้างอย่างรวดเร็ว เหมือนกำลังวิ่งอยู่กับที่' },
  { name: 'Burpee', targetMuscle: 'ทั้งตัว', equipment: 'น้ำหนักตัวเอง', category: 'cardio', difficulty: 'advanced', mediaUrl: '/exercises/burpee.png', description: 'ย่อตัวลงมือแตะพื้น กระโดดขาถอยไปด้านหลังเป็นท่า Plank ทำ Push-up แล้วกระโดดขากลับและกระโดดขึ้นสูง' },
  { name: 'Jumping Jack', targetMuscle: 'ทั้งตัว', equipment: 'น้ำหนักตัวเอง', category: 'cardio', difficulty: 'beginner', mediaUrl: '/exercises/jumping-jack.jpg', description: 'กระโดดกางแขนกางขาพร้อมกัน แล้วกระโดดกลับมาชิดขาแนบลำตัว ทำต่อเนื่องเป็นจังหวะ' },
  { name: 'High Knees', targetMuscle: 'ขา', equipment: 'น้ำหนักตัวเอง', category: 'cardio', difficulty: 'beginner', mediaUrl: '/exercises/high-knees.jpg', description: 'วิ่งอยู่กับที่พร้อมยกเข่าให้สูงถึงระดับสะโพกสลับข้างอย่างรวดเร็ว' },
  { name: 'Treadmill Incline Walk', targetMuscle: 'คาร์ดิโอ', equipment: 'อุปกรณ์คาร์ดิโอ', category: 'cardio', difficulty: 'beginner', mediaUrl: '/exercises/treadmill-incline-walk.png', description: 'เดินหรือวิ่งเหยาะบนลู่วิ่งแบบปรับความชัน ช่วยเพิ่มอัตราการเต้นหัวใจและความแข็งแรงของขา' },
  { name: 'Elliptical Trainer', targetMuscle: 'คาร์ดิโอ', equipment: 'อุปกรณ์คาร์ดิโอ', category: 'cardio', difficulty: 'beginner', mediaUrl: '/exercises/elliptical-trainer.jpg', description: 'ก้าวเท้าบนเครื่องเอลลิปติคัลพร้อมแกว่งแขน เคลื่อนไหวลื่นไหลแรงกระแทกต่ำ เหมาะกับทุกระดับ' },
  { name: 'Stationary Bike', targetMuscle: 'คาร์ดิโอ', equipment: 'อุปกรณ์คาร์ดิโอ', category: 'cardio', difficulty: 'beginner', mediaUrl: '/exercises/stationary-bike.png', description: 'ปั่นจักรยานอยู่กับที่ ปรับแรงต้านและความเร็วเพื่อฝึกหัวใจและความทนทานของขา' },
  { name: 'Rowing Machine', targetMuscle: 'หลัง', equipment: 'อุปกรณ์คาร์ดิโอ', category: 'cardio', difficulty: 'intermediate', mediaUrl: '/exercises/rowing-machine.png', description: 'ดึงมือจับพร้อมออกแรงจากขา สะโพก และหลัง ในจังหวะเดียวกัน เป็นคาร์ดิโอที่ใช้กล้ามเนื้อทั้งตัว' },

  // ---- Weight Training (ใช้อุปกรณ์) ----
  { name: 'Dumbbell Row', targetMuscle: 'หลัง', equipment: 'ดัมเบล', category: 'weight', difficulty: 'intermediate', mediaUrl: '/exercises/dumbbell-row.gif', description: 'ก้มตัวไปข้างหน้า มือถือดัมเบล ดึงข้อศอกขึ้นข้างลำตัวจนดัมเบลชิดซี่โครง แล้วค่อยๆ ลดลง' },
  { name: 'Russian Twist', targetMuscle: 'แกนกลางลำตัว', equipment: 'น้ำหนักตัวเอง', category: 'weight', difficulty: 'beginner', mediaUrl: '/exercises/russian-twist.gif', description: 'นั่งเอนตัวเล็กน้อยยกเท้าลอยพื้น หมุนลำตัวแตะพื้นซ้าย-ขวาสลับกันโดยรักษาหลังให้ตรง' },
  { name: 'Barbell Bench Press', targetMuscle: 'อก', equipment: 'บาร์เบล', category: 'weight', difficulty: 'intermediate', mediaUrl: '/exercises/barbell-bench-press.gif', description: 'นอนบนม้านั่ง จับบาร์เบลกว้างกว่าหัวไหล่ ลดบาร์ลงแตะหน้าอกแล้วดันขึ้นจนแขนเหยียดตรง' },
  { name: 'Incline Dumbbell Press', targetMuscle: 'อก', equipment: 'ดัมเบล', category: 'weight', difficulty: 'intermediate', mediaUrl: '/exercises/incline-dumbbell-press.gif', description: 'นอนบนม้านั่งปรับเอียง ดันดัมเบลขึ้นจากระดับหน้าอกส่วนบนจนแขนเหยียดตรง' },
  { name: 'Shoulder Press', targetMuscle: 'ไหล่', equipment: 'ดัมเบล', category: 'weight', difficulty: 'intermediate', mediaUrl: '/exercises/shoulder-press.gif', description: 'นั่งหรือยืน ถือดัมเบลระดับไหล่ ดันขึ้นเหนือศีรษะจนแขนเหยียดตรงแล้วลดลง' },
  { name: 'Lateral Raise', targetMuscle: 'ไหล่', equipment: 'ดัมเบล', category: 'weight', difficulty: 'beginner', mediaUrl: '/exercises/lateral-raise.gif', description: 'ยืนถือดัมเบลข้างลำตัว ยกแขนกางออกด้านข้างจนขนานพื้นแล้วค่อยๆ ลดลง' },
  { name: 'Barbell Curl', targetMuscle: 'ไบเซ็ป', equipment: 'บาร์เบล', category: 'weight', difficulty: 'beginner', mediaUrl: '/exercises/barbell-curl.gif', description: 'ยืนถือบาร์เบลมือหงาย งอข้อศอกยกบาร์ขึ้นหาหัวไหล่โดยล็อกข้อศอกไม่ให้แกว่ง' },
  { name: 'Hammer Curl', targetMuscle: 'ไบเซ็ป', equipment: 'ดัมเบล', category: 'weight', difficulty: 'beginner', mediaUrl: '/exercises/hammer-curl.gif', description: 'ถือดัมเบลแบบมือคว่ำเข้าหากัน (แนวค้อน) งอข้อศอกยกขึ้นสลับข้างหรือพร้อมกัน' },
  { name: 'Triceps Pushdown', targetMuscle: 'ไตรเซ็ป', equipment: 'เครื่องเคเบิล', category: 'weight', difficulty: 'beginner', mediaUrl: '/exercises/triceps-pushdown.gif', description: 'ยืนหน้าเครื่องเคเบิล จับบาร์ระดับอก กดแขนลงจนเหยียดตรงโดยล็อกข้อศอกไว้กับลำตัว' },
  { name: 'Lat Pulldown', targetMuscle: 'หลัง', equipment: 'เครื่องเคเบิล', category: 'weight', difficulty: 'beginner', mediaUrl: '/exercises/lat-pulldown.gif', description: 'นั่งจับบาร์กว้างกว่าหัวไหล่ ดึงบาร์ลงมาระดับอกบนโดยเกร็งกล้ามเนื้อหลังดึงข้อศอกลง' },
  { name: 'Seated Cable Row', targetMuscle: 'หลัง', equipment: 'เครื่องเคเบิล', category: 'weight', difficulty: 'beginner', mediaUrl: '/exercises/seated-cable-row.gif', description: 'นั่งจับมือจับ ดึงเข้าหาลำตัวโดยรักษาหลังตรงและสะบักหุบเข้าหากัน' },
  { name: 'Barbell Deadlift', targetMuscle: 'หลัง', equipment: 'บาร์เบล', category: 'weight', difficulty: 'advanced', mediaUrl: '/exercises/barbell-deadlift.gif', description: 'ยืนแยกขาเท่าสะโพก ก้มตัวจับบาร์เบล ยกขึ้นด้วยแรงจากขาและสะโพกโดยรักษาหลังตรงตลอดการเคลื่อนไหว' },
  { name: 'Sumo Deadlift', targetMuscle: 'สะโพก', equipment: 'บาร์เบล', category: 'weight', difficulty: 'advanced', mediaUrl: '/exercises/sumo-deadlift.gif', description: 'ยืนแยกขากว้าง ปลายเท้าชี้ออก จับบาร์เบลด้านในขา ยกขึ้นด้วยแรงจากสะโพกและขาด้านใน' },
  { name: 'Leg Curl', targetMuscle: 'ขา', equipment: 'เครื่องออกกำลังกาย', category: 'weight', difficulty: 'beginner', mediaUrl: '/exercises/leg-curl.gif', description: 'นอนคว่ำบนเครื่อง งอเข่าดึงแผ่นรองขึ้นมาหาก้นแล้วค่อยๆ คลายกลับ เน้นกล้ามเนื้อต้นขาด้านหลัง' },
  { name: 'Calf Raise', targetMuscle: 'ขา', equipment: 'ดัมเบล', category: 'weight', difficulty: 'beginner', mediaUrl: '/exercises/calf-raise.gif', description: 'ยืนปลายเท้าบนขอบยกพื้น เขย่งส้นเท้าขึ้นสูงสุดแล้วค่อยๆ ลดลงต่ำกว่าระดับพื้นเพื่อยืดน่อง' },
];

async function main() {
  console.log('🌱 Starting seed...\n');

  for (const seedUser of seedUsers) {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ? LIMIT 1', [seedUser.email]);

    if (existing.length > 0) {
      console.log(`⚠️  Already exists: ${seedUser.email} — skipping`);
      continue;
    }

    const hashedPassword = await bcrypt.hash(seedUser.password, 12);
    const id = uuidv4();

    await pool.query(
      'INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)',
      [id, seedUser.email, hashedPassword, seedUser.name, seedUser.role]
    );

    console.log(`✅ Created [${seedUser.role}]:`);
    console.log('   📧 Email   :', seedUser.email);
    console.log('   🔑 Password:', seedUser.password);
    console.log('   👤 Name    :', seedUser.name);
    console.log('   🆔 ID      :', id);
    console.log('');
  }

  let insertedCount = 0;
  let updatedCount = 0;
  for (const ex of seedExercises) {
    const [existing] = await pool.query('SELECT id FROM exercises WHERE name = ? LIMIT 1', [ex.name]);
    if (existing.length > 0) {
      await pool.query(
        `UPDATE exercises SET target_muscle = ?, equipment = ?, category = ?, difficulty = ?, media_url = ?, description = ?
         WHERE id = ?`,
        [ex.targetMuscle, ex.equipment, ex.category, ex.difficulty, ex.mediaUrl, ex.description, existing[0].id]
      );
      updatedCount += 1;
      continue;
    }
    await pool.query(
      'INSERT INTO exercises (id, name, target_muscle, equipment, category, difficulty, media_url, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [uuidv4(), ex.name, ex.targetMuscle, ex.equipment, ex.category, ex.difficulty, ex.mediaUrl, ex.description]
    );
    insertedCount += 1;
  }
  console.log(`✅ Exercises: ${insertedCount} inserted, ${updatedCount} updated\n`);

  console.log('🎉 Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
