/**
 * auth.repository.js — Data access layer สำหรับ Auth
 * รวม SQL query ที่เกี่ยวกับตาราง users ไว้ที่นี่ที่เดียว
 */

const { pool } = require('../../database');

/**
 * ค้นหาผู้ใช้จาก email (เฉพาะบัญชีที่ยังไม่ถูก soft-delete)
 * คืน password_hash มาด้วยเพื่อใช้เทียบรหัสผ่านใน service
 */
async function findByEmail(email) {
  const [rows] = await pool.query(
    'SELECT id, email, password_hash, role, is_active FROM users WHERE email = ? AND deleted_at IS NULL LIMIT 1',
    [email],
  );
  return rows[0] || null;
}

/**
 * ตรวจว่ามี email นี้อยู่แล้วหรือไม่ (ใช้ตอน register)
 */
async function existsByEmail(email) {
  const [rows] = await pool.query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
  return rows.length > 0;
}

/**
 * สร้างผู้ใช้ใหม่
 */
async function createUser({ id, email, passwordHash, role }) {
  await pool.query('INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?)', [
    id,
    email,
    passwordHash,
    role,
  ]);
  return { id, email, role };
}

module.exports = { findByEmail, existsByEmail, createUser };
