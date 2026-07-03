/**
 * prisma/seed.js
 *
 * Seed Script — สร้างข้อมูลผู้ใช้ตั้งต้นสำหรับทดสอบ
 * รันด้วย: npm run seed
 *
 * 📧 Email   : admin@gymyam.com
 * 🔑 Password: admin1234
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...\n');

  // ============================================================
  // Seed Accounts
  // ============================================================
  const seedUsers = [
    {
      email: 'admin@gymyam.com',
      password: 'admin1234',
      name: 'Admin Gymyam',
      role: 'admin',
    },
    {
      email: 'user@gymyam.com',
      password: 'user1234',
      name: 'User Gymyam',
      role: 'user',
    },
  ];

  for (const seedUser of seedUsers) {
    // ตรวจสอบว่ามี User อยู่แล้วหรือยัง
    const existing = await prisma.user.findUnique({
      where: { email: seedUser.email },
    });

    if (existing) {
      console.log(`⚠️  Already exists: ${seedUser.email} — skipping`);
      continue;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(seedUser.password, 12);

    // สร้าง User
    const user = await prisma.user.create({
      data: {
        id: uuidv4(),
        email: seedUser.email,
        password: hashedPassword,
        name: seedUser.name,
        role: seedUser.role,
      },
    });

    console.log(`✅ Created [${user.role}]:`);
    console.log('   📧 Email   :', user.email);
    console.log('   🔑 Password:', seedUser.password);
    console.log('   👤 Name    :', user.name);
    console.log('   🆔 ID      :', user.id);
    console.log('');
  }

  console.log('🎉 Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
