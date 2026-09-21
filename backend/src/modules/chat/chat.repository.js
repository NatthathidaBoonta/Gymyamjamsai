/**
 * chat.repository.js — Data access สำหรับแชทกลุ่มของคอร์ส (chat_messages)
 */

const crypto = require('crypto');
const { pool } = require('../../database');

const SELECT = `
  SELECT m.id, m.activity_id, m.sender_id, m.message, m.created_at,
         ROUND(UNIX_TIMESTAMP(m.created_at) * 1000) AS created_ms,
         u.role, p.first_name, p.last_name
  FROM chat_messages m
  JOIN users u ON u.id = m.sender_id
  LEFT JOIN user_profiles p ON p.user_id = u.id
`;

/**
 * ข้อความของคอร์ส — ถ้ามี after (created_ms ของข้อความล่าสุดที่มี) คืนเฉพาะที่ใหม่กว่า
 * เทียบเวลาใน MySQL ทั้งคู่ (UNIX_TIMESTAMP) — กัน timezone ของ Node กับ MySQL ไม่ตรงกัน
 * ไม่มี after: คืน `limit` ข้อความล่าสุด เรียงเก่า→ใหม่
 */
async function listByActivity(activityId, { after, limit = 100 }) {
  if (after) {
    const [rows] = await pool.query(
      `${SELECT} WHERE m.activity_id = ? AND UNIX_TIMESTAMP(m.created_at) * 1000 > ? ORDER BY m.created_at ASC LIMIT ${limit}`,
      [activityId, after],
    );
    return rows;
  }
  const [rows] = await pool.query(
    `${SELECT} WHERE m.activity_id = ? ORDER BY m.created_at DESC LIMIT ${limit}`,
    [activityId],
  );
  return rows.reverse();
}

async function insert(activityId, senderId, message) {
  const id = crypto.randomUUID();
  await pool.query('INSERT INTO chat_messages (id, activity_id, sender_id, message) VALUES (?, ?, ?, ?)', [
    id,
    activityId,
    senderId,
    message,
  ]);
  const [rows] = await pool.query(`${SELECT} WHERE m.id = ? LIMIT 1`, [id]);
  return rows[0];
}

async function findActivity(activityId) {
  const [rows] = await pool.query('SELECT id, title, status, trainer_id FROM activities WHERE id = ? LIMIT 1', [
    activityId,
  ]);
  return rows[0] || null;
}

async function memberStatus(activityId, userId) {
  const [rows] = await pool.query(
    'SELECT status FROM activity_registrations WHERE activity_id = ? AND user_id = ? LIMIT 1',
    [activityId, userId],
  );
  return rows.length ? rows[0].status : null;
}

/** user id ของทุกคนในห้อง (เทรนเนอร์ + สมาชิก approved) ยกเว้นผู้ส่ง */
async function participantIds(activityId, excludeUserId) {
  const [rows] = await pool.query(
    `SELECT trainer_id AS user_id FROM activities WHERE id = ?
     UNION
     SELECT user_id FROM activity_registrations WHERE activity_id = ? AND status = 'approved'`,
    [activityId, activityId],
  );
  return rows.map((r) => r.user_id).filter((id) => id !== excludeUserId);
}

module.exports = { listByActivity, insert, findActivity, memberStatus, participantIds };
