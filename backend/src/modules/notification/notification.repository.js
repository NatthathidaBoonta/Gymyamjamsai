/**
 * notification.repository.js — Data access layer สำหรับ Notifications
 */

const crypto = require('crypto');
const { pool } = require('../../database');

/**
 * ดึง notifications ของ user (pagination)
 */
async function listByUser(userId, limit = 20, offset = 0, unreadOnly = false) {
  let query = `
    SELECT id, title, message, type, related_id, is_read, created_at
    FROM notifications
    WHERE user_id = ?
  `;
  const params = [userId];

  if (unreadOnly) {
    query += ' AND is_read = FALSE';
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const [rows] = await pool.query(query, params);
  return rows;
}

/**
 * นับ unread notifications
 */
async function countUnread(userId) {
  const [[row]] = await pool.query(
    'SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = FALSE',
    [userId],
  );
  return Number(row.count);
}

/**
 * สร้าง notification ใหม่
 */
async function create({ userId, title, message, type, relatedId }) {
  const id = crypto.randomUUID();
  await pool.query(
    `INSERT INTO notifications (id, user_id, title, message, type, related_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, userId, title, message, type, relatedId || null],
  );
  return id;
}

/**
 * อ่าน notification (mark as read)
 */
async function markAsRead(notificationId, userId) {
  const [result] = await pool.query(
    'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
    [notificationId, userId],
  );
  return result.affectedRows;
}

/**
 * อ่านทั้งหมดของ user
 */
async function markAllAsReadByUser(userId) {
  await pool.query('UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE', [userId]);
}

/**
 * ลบ notification
 */
async function deleteOne(notificationId, userId) {
  const [result] = await pool.query('DELETE FROM notifications WHERE id = ? AND user_id = ?', [
    notificationId,
    userId,
  ]);
  return result.affectedRows;
}

/**
 * ลบ notifications เก่า (cleanup)
 */
async function deleteOldNotifications(daysOld = 30) {
  const date = new Date();
  date.setDate(date.getDate() - daysOld);
  await pool.query('DELETE FROM notifications WHERE created_at < ? AND is_read = TRUE', [date]);
}

/**
 * มีแจ้งเตือนชนิด/รายการเดียวกันที่ยังไม่อ่านภายใน N นาทีหรือไม่ (ใช้กันเด้งรัว เช่น แชท)
 */
async function hasRecentUnread(userId, type, relatedId, minutes) {
  const [rows] = await pool.query(
    `SELECT id FROM notifications
     WHERE user_id = ? AND type = ? AND related_id <=> ? AND is_read = FALSE
       AND created_at >= DATE_SUB(NOW(), INTERVAL ? MINUTE) LIMIT 1`,
    [userId, type, relatedId || null, minutes],
  );
  return rows.length > 0;
}

/** user id ของแอดมินที่ยังใช้งาน (สำหรับแจ้งงานที่รออนุมัติ) */
async function listAdminIds() {
  const [rows] = await pool.query(
    "SELECT id FROM users WHERE role = 'admin' AND is_active = TRUE AND deleted_at IS NULL",
  );
  return rows.map((r) => r.id);
}

module.exports = {
  hasRecentUnread,
  listAdminIds,
  listByUser,
  countUnread,
  create,
  markAsRead,
  markAllAsReadByUser,
  deleteOne,
  deleteOldNotifications,
};
