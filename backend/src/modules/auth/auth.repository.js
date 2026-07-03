/**
 * src/modules/auth/auth.repository.js
 * 
 * Repository สำหรับโมดูล Auth
 * จัดการ Database Operations ผ่าน Prisma ORM
 * 
 * ⚠️ Database logic ทั้งหมดอยู่ที่นี่เท่านั้น
 * หากเปลี่ยน DB ในอนาคต แก้เฉพาะไฟล์นี้
 */

const prisma = require('../../database');

/**
 * สร้าง User ใหม่ใน Database
 * @param {{ id: string, email: string, password: string, name?: string }} userData
 * @returns {Promise<Object>} user
 */
const createUser = async (userData) => {
  return prisma.user.create({
    data: {
      id: userData.id,
      email: userData.email,
      password: userData.password,
      name: userData.name || null,
    },
  });
};

/**
 * ค้นหา User ด้วย Email
 * @param {string} email
 * @returns {Promise<Object|null>} user or null
 */
const findUserByEmail = async (email) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

/**
 * ค้นหา User ด้วย ID
 * @param {string} id
 * @returns {Promise<Object|null>} user or null
 */
const findUserById = async (id) => {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      // ไม่ select password เพื่อความปลอดภัย
    },
  });
};

module.exports = { createUser, findUserByEmail, findUserById };
