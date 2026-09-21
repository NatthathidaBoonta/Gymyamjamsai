/**
 * activity.service.js — Business logic สำหรับ Activity module
 */

const repo = require('./activity.repository');
const notificationService = require('../notification/notification.service');

function httpError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

/**
 * ตรวจว่ากิจกรรมมีอยู่จริงและ trainer คนนี้เป็นเจ้าของ (กันดูคลาสคนอื่น)
 */
async function assertOwnedByTrainer(activityId, trainerId) {
  const activity = await repo.findById(activityId);
  if (!activity) throw httpError('ไม่พบกิจกรรมที่ระบุ', 404);
  if (activity.trainer_id !== trainerId) {
    throw httpError('เข้าถึงได้เฉพาะกิจกรรมที่ตนเองสร้างเท่านั้น', 403);
  }
  return activity;
}

async function list(viewerId) {
  return repo.listAll(viewerId);
}

async function create(trainerId, dto) {
  return repo.create({ trainerId, ...dto });
}

async function update(activityId, trainerId, dto) {
  const activity = await assertOwnedByTrainer(activityId, trainerId);
  if (activity.status === 'closed') throw httpError('กิจกรรมนี้ถูกยกเลิกแล้ว แก้ไขไม่ได้', 409);
  await repo.update(activityId, dto);
  return { id: activityId };
}

async function cancel(activityId, trainerId) {
  const activity = await assertOwnedByTrainer(activityId, trainerId);
  if (activity.status === 'closed') throw httpError('กิจกรรมนี้ถูกยกเลิกไปแล้ว', 409);
  const memberIds = await repo.close(activityId);
  // แจ้งผู้ที่จองไว้ — ไม่ให้การแจ้งเตือนล้มทำให้การยกเลิกล้ม
  try {
    await Promise.all(
      memberIds.map((uid) =>
        notificationService.notify(
          uid,
          '❌ กิจกรรมถูกยกเลิก',
          `"${activity.title}" ถูกยกเลิกโดยผู้ฝึกสอน`,
          'activity',
          activityId,
        ),
      ),
    );
  } catch (e) {
    console.error('[activity.cancel] notify failed:', e.message);
  }
  return { id: activityId, status: 'closed', notified: memberIds.length };
}

async function register(activityId, userId) {
  const result = await repo.register(activityId, userId);
  // แจ้งเทรนเนอร์เจ้าของคอร์สว่ามีคำขอใหม่ — ไม่ให้การแจ้งเตือนล้มทำให้การจองล้ม
  try {
    const activity = await repo.findById(activityId);
    if (activity) {
      await notificationService.notify(
        activity.trainer_id,
        '📝 มีคำขอเข้าร่วมคอร์ส',
        `มีสมาชิกขอเข้าร่วม "${activity.title}" — รอการอนุมัติจากคุณ`,
        'activity',
        activityId,
      );
    }
  } catch (e) {
    console.error('[activity.register] notify failed:', e.message);
  }
  return result;
}

async function cancelRegistration(activityId, userId) {
  const activity = await repo.findById(activityId);
  if (!activity) throw httpError('ไม่พบกิจกรรมที่ระบุ', 404);
  const affected = await repo.cancelRegistration(activityId, userId);
  if (affected === 0) throw httpError('คุณยังไม่ได้ลงทะเบียนกิจกรรมนี้', 404);
  return { activity_id: activityId, status: 'cancelled' };
}

async function getParticipants(activityId, trainerId) {
  await assertOwnedByTrainer(activityId, trainerId);
  return repo.getParticipants(activityId);
}

async function markAttendance(activityId, trainerId, { userId, attended }) {
  await assertOwnedByTrainer(activityId, trainerId);
  const affected = await repo.setAttendance(activityId, userId, attended);
  if (affected === 0) throw httpError('ไม่พบผู้ลงทะเบียนที่ระบุในกิจกรรมนี้ (หรือยังไม่อนุมัติ)', 404);
  return { user_id: userId, attended };
}

// ---------- Phase 16: อนุมัติผู้สมัคร (คอร์สแบบต้องอนุมัติ) ----------
async function reviewParticipant(activityId, trainerId, userId, decision) {
  const activity = await assertOwnedByTrainer(activityId, trainerId);
  if (activity.status === 'closed') throw httpError('คอร์สนี้ปิดแล้ว', 409);

  const status = decision === 'approve' ? 'approved' : 'rejected';
  const affected = await repo.updateRegistrationStatus(activityId, userId, status);
  if (affected === 0) {
    throw httpError(
      decision === 'approve' ? 'ไม่พบคำขอที่รอการอนุมัติของผู้ใช้นี้' : 'ไม่พบผู้สมัครที่ระบุในคอร์สนี้',
      404,
    );
  }
  try {
    await notificationService.notify(
      userId,
      decision === 'approve' ? '✅ ได้รับการอนุมัติเข้าร่วมคอร์ส' : '❌ คำขอเข้าร่วมคอร์สถูกปฏิเสธ',
      decision === 'approve'
        ? `คุณเข้าร่วม "${activity.title}" ได้แล้ว และเข้าห้องแชทของคอร์สได้ทันที`
        : `ผู้ฝึกสอนปฏิเสธคำขอเข้าร่วม "${activity.title}"`,
      'activity',
      activityId,
    );
  } catch (e) {
    console.error('[activity.review] notify failed:', e.message);
  }
  return { user_id: userId, status };
}

module.exports = {
  list,
  create,
  update,
  cancel,
  register,
  cancelRegistration,
  getParticipants,
  markAttendance,
  reviewParticipant,
};
