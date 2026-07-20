/**
 * notification.service.js — Business logic สำหรับ Notifications
 */

const repo = require('./notification.repository');

/**
 * ดึง notifications ของ member
 */
async function list(userId, limit = 20, offset = 0, unreadOnly = false) {
  return repo.listByUser(userId, limit, offset, unreadOnly);
}

/**
 * นับ unread notifications
 */
async function getUnreadCount(userId) {
  return repo.countUnread(userId);
}

/**
 * สร้าง notification (trigger เมื่อมีเหตุการณ์)
 */
async function notify(userId, title, message, type, relatedId) {
  return repo.create({
    userId,
    title,
    message,
    type,
    relatedId,
  });
}

/**
 * Mark notification as read
 */
async function read(notificationId) {
  await repo.markAsRead(notificationId);
}

/**
 * Mark all as read
 */
async function readAll(userId) {
  await repo.markAllAsReadByUser(userId);
}

/**
 * ลบ notification
 */
async function remove(notificationId) {
  await repo.deleteOne(notificationId);
}

/**
 * ส่งข่าวแจ้ง activity ใหม่ให้สมาชิก
 */
async function notifyActivityCreated(activityTitle, trainerName, memberIds) {
  const promises = memberIds.map((memberId) =>
    notify(
      memberId,
      '🔔 กิจกรรมใหม่',
      `มี "${activityTitle}" จาก ${trainerName}`,
      'activity',
      null,
    ),
  );
  await Promise.all(promises);
}

/**
 * ส่งข่าวแจ้งตัวตัวตนการจดทะเบียน
 */
async function notifyRegistration(memberName, trainerId, activityTitle) {
  await notify(
    trainerId,
    '📝 มีการลงทะเบียน',
    `${memberName} ลงทะเบียน "${activityTitle}"`,
    'activity',
    null,
  );
}

module.exports = {
  list,
  getUnreadCount,
  notify,
  read,
  readAll,
  remove,
  notifyActivityCreated,
  notifyRegistration,
};
