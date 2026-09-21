/**
 * exercise-suggestion.repository.js — Data access สำหรับข้อเสนอแก้ไขท่า (Trainer → Admin)
 */

const crypto = require('crypto');
const { pool } = require('../../database');

const SELECT = `
  SELECT s.id, s.exercise_id, s.trainer_id, s.payload, s.note, s.status,
         s.reviewed_by, s.review_note, s.reviewed_at, s.created_at,
         e.name AS exercise_name, e.media_url AS exercise_media_url,
         TRIM(CONCAT(COALESCE(tp.first_name, ''), ' ', COALESCE(tp.last_name, ''))) AS trainer_name,
         tu.email AS trainer_email,
         TRIM(CONCAT(COALESCE(rp.first_name, ''), ' ', COALESCE(rp.last_name, ''))) AS reviewer_name
  FROM exercise_suggestions s
  JOIN exercises e ON e.id = s.exercise_id
  JOIN users tu ON tu.id = s.trainer_id
  LEFT JOIN user_profiles tp ON tp.user_id = s.trainer_id
  LEFT JOIN user_profiles rp ON rp.user_id = s.reviewed_by
`;

function normalize(row) {
  if (!row) return null;
  return {
    ...row,
    payload: typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload,
    trainer_name: row.trainer_name || null,
    reviewer_name: row.reviewer_name || null,
  };
}

async function create({ exerciseId, trainerId, payload, note }) {
  const id = crypto.randomUUID();
  await pool.query(
    'INSERT INTO exercise_suggestions (id, exercise_id, trainer_id, payload, note) VALUES (?, ?, ?, ?, ?)',
    [id, exerciseId, trainerId, JSON.stringify(payload), note],
  );
  return findById(id);
}

async function findById(id) {
  const [rows] = await pool.query(`${SELECT} WHERE s.id = ? LIMIT 1`, [id]);
  return normalize(rows[0]);
}

/**
 * รายการข้อเสนอ — admin เห็นทั้งหมด, trainer เห็นเฉพาะของตัวเอง
 */
async function list({ trainerId, status }) {
  const where = [];
  const params = [];
  if (trainerId) {
    where.push('s.trainer_id = ?');
    params.push(trainerId);
  }
  if (status) {
    where.push('s.status = ?');
    params.push(status);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const [rows] = await pool.query(
    `${SELECT} ${whereSql} ORDER BY FIELD(s.status, 'pending', 'approved', 'rejected'), s.created_at DESC`,
    params,
  );
  return rows.map(normalize);
}

async function countPending() {
  const [[{ c }]] = await pool.query("SELECT COUNT(*) AS c FROM exercise_suggestions WHERE status = 'pending'");
  return Number(c);
}

/** มีข้อเสนอค้างอยู่ของท่านี้จาก trainer คนนี้หรือไม่ (กันส่งซ้ำ) */
async function hasPending(exerciseId, trainerId) {
  const [rows] = await pool.query(
    "SELECT id FROM exercise_suggestions WHERE exercise_id = ? AND trainer_id = ? AND status = 'pending' LIMIT 1",
    [exerciseId, trainerId],
  );
  return rows.length > 0;
}

/**
 * อนุมัติ: ใช้ transaction — เขียน payload ลง exercises และปิดข้อเสนอพร้อมกัน
 * @returns {boolean} false ถ้าข้อเสนอไม่ได้อยู่ในสถานะ pending แล้ว
 */
async function approve(id, reviewerId, reviewNote) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.query(
      'SELECT exercise_id, payload, status FROM exercise_suggestions WHERE id = ? FOR UPDATE',
      [id],
    );
    if (!rows.length || rows[0].status !== 'pending') {
      await conn.rollback();
      return false;
    }
    const payload = typeof rows[0].payload === 'string' ? JSON.parse(rows[0].payload) : rows[0].payload;
    const columns = Object.keys(payload);
    if (columns.length) {
      await conn.query(
        `UPDATE exercises SET ${columns.map((c) => `${c} = ?`).join(', ')} WHERE id = ?`,
        [...columns.map((c) => payload[c]), rows[0].exercise_id],
      );
    }
    await conn.query(
      "UPDATE exercise_suggestions SET status = 'approved', reviewed_by = ?, review_note = ?, reviewed_at = NOW() WHERE id = ?",
      [reviewerId, reviewNote, id],
    );
    await conn.commit();
    return true;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function reject(id, reviewerId, reviewNote) {
  const [result] = await pool.query(
    "UPDATE exercise_suggestions SET status = 'rejected', reviewed_by = ?, review_note = ?, reviewed_at = NOW() WHERE id = ? AND status = 'pending'",
    [reviewerId, reviewNote, id],
  );
  return result.affectedRows > 0;
}

/** trainer ถอนข้อเสนอของตัวเองที่ยัง pending */
async function withdraw(id, trainerId) {
  const [result] = await pool.query(
    "DELETE FROM exercise_suggestions WHERE id = ? AND trainer_id = ? AND status = 'pending'",
    [id, trainerId],
  );
  return result.affectedRows > 0;
}

module.exports = { create, findById, list, countPending, hasPending, approve, reject, withdraw };
