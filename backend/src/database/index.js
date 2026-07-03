/**
 * src/database/index.js
 *
 * Prisma Client Singleton
 * 
 * ใช้รูปแบบ Singleton เพื่อไม่ให้สร้าง connection ใหม่ทุกครั้งที่ import
 * การเปลี่ยน Database ทำได้โดยเปลี่ยน DATABASE_URL และ provider ใน schema.prisma เท่านั้น
 */

const { PrismaClient } = require('@prisma/client');

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // ใน development ป้องกัน hot-reload สร้าง connection หลายตัว
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
  }
  prisma = global.__prisma;
}

module.exports = prisma;
