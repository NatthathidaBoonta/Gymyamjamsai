/**
 * activity.service.js — Business logic สำหรับ Activity module
 */

const repo = require('./activity.repository');

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

async function list() {
  return repo.listAll();
}

async function create(trainerId, dto) {
  return repo.create({ trainerId, ...dto });
}

async function register(activityId, userId) {
  return repo.register(activityId, userId);
}

async function getParticipants(activityId, trainerId) {
  await assertOwnedByTrainer(activityId, trainerId);
  return repo.getParticipants(activityId);
}

async function markAttendance(activityId, trainerId, { userId, attended }) {
  await assertOwnedByTrainer(activityId, trainerId);
  const affected = await repo.setAttendance(activityId, userId, attended);
  if (affected === 0) throw httpError('ไม่พบผู้ลงทะเบียนที่ระบุในกิจกรรมนี้', 404);
  return { user_id: userId, attended };
}

module.exports = { list, create, register, getParticipants, markAttendance };
