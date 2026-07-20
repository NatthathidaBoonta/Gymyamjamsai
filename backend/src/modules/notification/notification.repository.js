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
async function markAsRead(notificationId) {
  await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = ?', [notificationId]);
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
async function deleteOne(notificationId) {
  await pool.query('DELETE FROM notifications WHERE id = ?', [notificationId]);
}

/**
 * ลบ notifications เก่า (cleanup)
 */
async function deleteOldNotifications(daysOld = 30) {
  const date = new Date();
  date.setDate(date.getDate() - daysOld);
  await pool.query('DELETE FROM notifications WHERE created_at < ? AND is_read = TRUE', [date]);
}

module.exports = {
  listByUser,
  countUnread,
  create,
  markAsRead,
  markAllAsReadByUser,
  deleteOne,
  deleteOldNotifications,
};
