/**
 * exercise.repository.js — Data access layer สำหรับคลังท่าออกกำลังกาย (exercises)
 */

const crypto = require('crypto');
const { pool } = require('../../database');

/**
 * ดึงรายการท่าแบบแบ่งหน้า
 * หมายเหตุ: limit/offset ถูก validate เป็น integer มาแล้วจาก DTO จึง interpolate
 * ตรงๆ ได้ (เลี่ยงปัญหา placeholder ของ LIMIT ใน mysql2) — ปลอดภัยจาก injection
 */
async function findAll({ limit, offset }) {
  const [items] = await pool.query(
    `SELECT id, name, category, media_url, instructions
     FROM exercises ORDER BY name LIMIT ${limit} OFFSET ${offset}`,
  );
  const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM exercises');
  return { items, total };
}

async function findById(id) {
  const [rows] = await pool.query(
    'SELECT id, name, category, media_url, instructions FROM exercises WHERE id = ? LIMIT 1',
    [id],
  );
  return rows[0] || null;
}

async function create({ name, category, media_url, instructions }) {
  const id = crypto.randomUUID();
  await pool.query(
    'INSERT INTO exercises (id, name, category, media_url, instructions) VALUES (?, ?, ?, ?, ?)',
    [id, name, category, media_url, instructions],
  );
  return findById(id);
}

/**
 * อัปเดตเฉพาะฟิลด์ที่ส่งมา (partial update)
 * @returns {number} จำนวนแถวที่ถูกแก้ (0 = ไม่พบ id)
 */
async function update(id, fields) {
  const columns = Object.keys(fields);
  if (columns.length === 0) return 0;
  const setClause = columns.map((c) => `${c} = ?`).join(', ');
  const values = columns.map((c) => fields[c]);
  const [result] = await pool.query(`UPDATE exercises SET ${setClause} WHERE id = ?`, [
    ...values,
    id,
  ]);
  return result.affectedRows;
}

async function remove(id) {
  const [result] = await pool.query('DELETE FROM exercises WHERE id = ?', [id]);
  return result.affectedRows;
}

module.exports = { findAll, findById, create, update, remove };
