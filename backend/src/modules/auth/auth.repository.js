/**
 * src/modules/auth/auth.repository.js
 *
 * Repository สำหรับโมดูล Auth
 * จัดการ Database Operations ผ่าน mysql2 (raw SQL)
 *
 * ⚠️ Database logic ทั้งหมดอยู่ที่นี่เท่านั้น
 * หากเปลี่ยน DB ในอนาคต แก้เฉพาะไฟล์นี้
 */

const pool = require('../../database');

/**
 * สร้าง User ใหม่ใน Database
 * @param {{ id: string, email: string, password: string, name?: string }} userData
 * @returns {Promise<Object>} user
 */
const createUser = async ({ id, email, password, name }) => {
  await pool.query(
    'INSERT INTO users (id, email, password, name) VALUES (?, ?, ?, ?)',
    [id, email, password, name || null]
  );
  return findUserById(id);
};

/**
 * ค้นหา User ด้วย Email (รวม password สำหรับตรวจสอบตอน login)
 * @param {string} email
 * @returns {Promise<Object|null>} user or null
 */
const findUserByEmail = async (email) => {
  const [rows] = await pool.query(
    `SELECT id, email, password, name, role,
            created_at AS createdAt, updated_at AS updatedAt
     FROM users WHERE email = ? LIMIT 1`,
    [email]
  );
  return rows[0] || null;
};

/**
 * ค้นหา User ด้วย ID (ไม่ select password เพื่อความปลอดภัย)
 * @param {string} id
 * @returns {Promise<Object|null>} user or null
 */
const findUserById = async (id) => {
  const [rows] = await pool.query(
    `SELECT id, email, name, role,
            created_at AS createdAt, updated_at AS updatedAt
     FROM users WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
};

module.exports = { createUser, findUserByEmail, findUserById };
