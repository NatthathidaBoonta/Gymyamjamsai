/**
 * src/database/index.js
 *
 * MySQL Connection Pool (mysql2/promise) — Phase 3
 *
 * ใช้รูปแบบ Singleton: สร้าง pool ครั้งเดียวแล้ว reuse ทุกที่ที่ import
 * pool เป็นแบบ lazy — ยังไม่เชื่อมต่อจริงจนกว่าจะมีการ query ครั้งแรก
 * ดังนั้นการ import ไฟล์นี้จะไม่ทำให้ process crash แม้ DB ยังไม่พร้อม
 */

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // จำกัดจำนวน connection กัน DB ล้ม
  queueLimit: 0,
  dateStrings: true, // คืนค่า DATE/DATETIME เป็น string กัน timezone เพี้ยน
});

/**
 * ทดสอบว่าเชื่อมต่อ DB ได้จริง (ใช้ใน health check)
 * ใช้ pool.query() ซึ่ง acquire + release connection ให้อัตโนมัติ
 * จึงไม่มีปัญหา connection ค้าง (ความเสี่ยงที่ระบุใน Phase 3)
 * @returns {Promise<boolean>}
 */
async function ping() {
  await pool.query('SELECT 1');
  return true;
}

/**
 * ปิด pool อย่างสมบูรณ์ (ใช้ตอน graceful shutdown)
 * @returns {Promise<void>}
 */
async function closePool() {
  await pool.end();
}

module.exports = { pool, ping, closePool };
