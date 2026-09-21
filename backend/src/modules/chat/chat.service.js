/**
 * chat.service.js — กติกาแชทกลุ่มของคอร์ส
 *
 * ใครเข้าห้องได้: เทรนเนอร์เจ้าของคอร์ส + สมาชิกที่สถานะ approved
 * แอดมินไม่เข้า (บทสนทนาอาจมีข้อมูลสุขภาพ — BR3) · คอร์ส closed = อ่านได้ ส่งไม่ได้
 */

const repo = require('./chat.repository');
const notificationService = require('../notification/notification.service');

const MAX_LEN = 2000;

function httpError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

/**
 * ตรวจสิทธิ์เข้าห้อง — คืน activity เมื่อผ่าน, โยน 403/404 เมื่อไม่ผ่าน
 */
async function assertAccess(activityId, user) {
  const activity = await repo.findActivity(activityId);
  if (!activity) throw httpError('ไม่พบคอร์สที่ระบุ', 404);

  if (user.role === 'trainer') {
    if (activity.trainer_id !== user.id) throw httpError('เข้าได้เฉพาะห้องแชทของคอร์สที่คุณสอน', 403);
    return activity;
  }
  if (user.role === 'member') {
    const status = await repo.memberStatus(activityId, user.id);
    if (status === 'pending') throw httpError('คำขอเข้าร่วมของคุณยังรอการอนุมัติจากผู้ฝึกสอน', 403);
    if (status !== 'approved') throw httpError('คุณยังไม่ได้เป็นผู้เข้าร่วมคอร์สนี้', 403);
    return activity;
  }
  throw httpError('ห้องแชทของคอร์สเปิดให้เฉพาะผู้ฝึกสอนและสมาชิกในคอร์ส', 403);
}

function sanitize(message) {
  const text = typeof message === 'string' ? message.replace(/\r\n/g, '\n').trim() : '';
  if (!text) throw httpError('ข้อความว่างเปล่า', 400);
  if (text.length > MAX_LEN) throw httpError(`ข้อความยาวเกิน ${MAX_LEN} ตัวอักษร`, 400);
  return text;
}

async function getRoom(activityId, user) {
  const activity = await assertAccess(activityId, user);
  return { id: activity.id, title: activity.title, status: activity.status, can_send: activity.status !== 'closed' };
}

async function getMessages(activityId, user, { after, limit }) {
  await assertAccess(activityId, user);
  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 100, 1), 200);
  const safeAfter = Number.isFinite(Number(after)) && Number(after) > 0 ? Number(after) : null;
  return repo.listByActivity(activityId, { after: safeAfter, limit: safeLimit });
}

async function sendMessage(activityId, user, message) {
  const activity = await assertAccess(activityId, user);
  if (activity.status === 'closed') throw httpError('คอร์สนี้ปิดแล้ว ส่งข้อความไม่ได้', 409);
  const text = sanitize(message);
  const saved = await repo.insert(activityId, user.id, text);

  // แจ้งคนอื่นในห้อง (กันซ้ำ 10 นาที/ห้อง/คน) — ไม่รอผล ไม่ให้กระทบการส่ง
  const senderName = `${saved.first_name ?? ''} ${saved.last_name ?? ''}`.trim() || (user.role === 'trainer' ? 'ผู้ฝึกสอน' : 'สมาชิก');
  const preview = text.length > 60 ? `${text.slice(0, 60)}…` : text;
  repo
    .participantIds(activityId, user.id)
    .then((ids) =>
      Promise.allSettled(
        ids.map((uid) =>
          notificationService.notifyDebounced(uid, `💬 ${activity.title}`, `${senderName}: ${preview}`, 'chat', activityId, 10),
        ),
      ),
    )
    .catch((e) => console.error('[chat.notify] failed:', e.message));

  return saved;
}

module.exports = { assertAccess, getRoom, getMessages, sendMessage, MAX_LEN };
