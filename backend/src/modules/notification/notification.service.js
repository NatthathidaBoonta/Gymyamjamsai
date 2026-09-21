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
 * แจ้งหลายคนพร้อมกัน — คนใดล้มไม่ทำให้คนอื่นล้ม
 */
async function notifyMany(userIds, title, message, type, relatedId) {
  const results = await Promise.allSettled(userIds.map((uid) => notify(uid, title, message, type, relatedId)));
  return results.filter((r) => r.status === 'fulfilled').length;
}

/**
 * แจ้งแบบกันซ้ำ: ถ้ามีแจ้งเตือนชนิด/รายการเดียวกันที่ยังไม่อ่านภายใน `minutes` ให้ข้าม
 * ใช้กับแชท (ข้อความรัวๆ ในห้องเดียว = แจ้งครั้งเดียวจนกว่าจะอ่าน)
 */
async function notifyDebounced(userId, title, message, type, relatedId, minutes = 10) {
  if (await repo.hasRecentUnread(userId, type, relatedId, minutes)) return false;
  await notify(userId, title, message, type, relatedId);
  return true;
}

/** แจ้งแอดมินทุกคน (งานที่รออนุมัติ) */
async function notifyAdmins(title, message, type, relatedId) {
  const ids = await repo.listAdminIds();
  return notifyMany(ids, title, message, type, relatedId);
}

/**
 * Mark notification as read
 */
async function read(notificationId, userId) {
  const affected = await repo.markAsRead(notificationId, userId);
  if (affected === 0) {
    const err = new Error('ไม่พบการแจ้งเตือนนี้');
    err.status = 404;
    throw err;
  }
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
async function remove(notificationId, userId) {
  const affected = await repo.deleteOne(notificationId, userId);
  if (affected === 0) {
    const err = new Error('ไม่พบการแจ้งเตือนนี้');
    err.status = 404;
    throw err;
  }
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
  notifyMany,
  notifyDebounced,
  notifyAdmins,
  list,
  getUnreadCount,
  notify,
  read,
  readAll,
  remove,
  notifyActivityCreated,
  notifyRegistration,
};
