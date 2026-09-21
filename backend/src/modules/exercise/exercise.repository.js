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
async function findAll({ limit, offset, q, category, difficulty }) {
  const where = [];
  const params = [];
  if (q) {
    where.push('(name LIKE ? OR muscle_group LIKE ? OR equipment LIKE ?)');
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  if (category) {
    where.push('category = ?');
    params.push(category);
  }
  if (difficulty) {
    where.push('difficulty = ?');
    params.push(difficulty);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const [items] = await pool.query(
    `SELECT id, name, category, muscle_group, equipment, difficulty, media_url, instructions, tips, updated_at
     FROM exercises ${whereSql} ORDER BY name LIMIT ${limit} OFFSET ${offset}`,
    params,
  );
  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM exercises ${whereSql}`, params);
  return { items, total };
}

async function findById(id) {
  const [rows] = await pool.query(
    'SELECT id, name, category, muscle_group, equipment, difficulty, media_url, instructions, tips, updated_at FROM exercises WHERE id = ? LIMIT 1',
    [id],
  );
  return rows[0] || null;
}

async function create({ name, category, muscle_group, equipment, difficulty, media_url, instructions, tips }) {
  const id = crypto.randomUUID();
  await pool.query(
    `INSERT INTO exercises (id, name, category, muscle_group, equipment, difficulty, media_url, instructions, tips)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, name, category, muscle_group, equipment, difficulty || 'beginner', media_url, instructions, tips],
  );
  return findById(id);
}

/** นับจำนวนท่าแยกตามหมวด (ใช้ในหน้า admin) */
async function countByCategory() {
  const [rows] = await pool.query(
    'SELECT COALESCE(category, "other") AS category, COUNT(*) AS count FROM exercises GROUP BY category ORDER BY count DESC',
  );
  return rows.map((r) => ({ category: r.category, count: Number(r.count) }));
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

module.exports = { findAll, findById, create, update, remove, countByCategory };
