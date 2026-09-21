/**
 * exercise-suggestion.service.js — กติกาของข้อเสนอแก้ไขท่า
 *
 * Trainer เสนอเฉพาะฟิลด์เนื้อหา (ไม่ใช่รูป/หมวด) → Admin อนุมัติแล้ว merge ลง exercises
 * ทุกการอนุมัติ/ปฏิเสธ แจ้ง trainer ผ่าน notification
 */

const repo = require('./exercise-suggestion.repository');
const exerciseRepo = require('../exercise/exercise.repository');
const notificationService = require('../notification/notification.service');

// ฟิลด์ที่ trainer เสนอแก้ได้ — จงใจไม่รวม media_url/category (สิทธิ์ admin เท่านั้น)
const SUGGESTABLE = ['name', 'muscle_group', 'equipment', 'difficulty', 'instructions', 'tips'];
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];
const MAX_LEN = { name: 255, muscle_group: 100, equipment: 100, instructions: 5000, tips: 2000 };

function httpError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

/**
 * รับเฉพาะฟิลด์ที่เปลี่ยนจากค่าปัจจุบันจริงๆ — ถ้าไม่มีอะไรเปลี่ยนไม่ให้ส่ง
 */
function buildPayload(body, current) {
  const payload = {};
  for (const key of SUGGESTABLE) {
    if (body[key] === undefined) continue;
    const value = body[key] === null ? null : String(body[key]).trim();
    if (key === 'name' && !value) throw httpError('ชื่อท่าต้องไม่เป็นค่าว่าง', 400);
    if (key === 'difficulty' && !DIFFICULTIES.includes(value)) {
      throw httpError(`difficulty ต้องเป็นหนึ่งใน: ${DIFFICULTIES.join(', ')}`, 400);
    }
    if (MAX_LEN[key] && value && value.length > MAX_LEN[key]) {
      throw httpError(`${key} ยาวเกิน ${MAX_LEN[key]} ตัวอักษร`, 400);
    }
    if ((current[key] ?? null) !== (value ?? null)) payload[key] = value;
  }
  if (Object.keys(payload).length === 0) throw httpError('ไม่มีฟิลด์ใดที่แตกต่างจากข้อมูลปัจจุบัน', 400);
  return payload;
}

async function create(exerciseId, trainerId, body) {
  const exercise = await exerciseRepo.findById(exerciseId);
  if (!exercise) throw httpError('ไม่พบท่าออกกำลังกายที่ระบุ', 404);
  if (await repo.hasPending(exerciseId, trainerId)) {
    throw httpError('คุณมีข้อเสนอของท่านี้ที่รอการอนุมัติอยู่แล้ว', 409);
  }
  const payload = buildPayload(body || {}, exercise);
  const note = body && body.note ? String(body.note).trim().slice(0, 500) : null;
  const created = await repo.create({ exerciseId, trainerId, payload, note });

  // แจ้งแอดมินทุกคนว่ามีข้อเสนอรอพิจารณา
  try {
    const fields = Object.keys(payload).length;
    await notificationService.notifyAdmins(
      '📝 ข้อเสนอแก้ไขท่าใหม่',
      `${created.trainer_name || created.trainer_email} เสนอแก้ "${exercise.name}" (${fields} ฟิลด์) — รอการอนุมัติ`,
      'suggestion',
      created.id,
    );
  } catch (e) {
    console.error('[suggestion.create] notify admins failed:', e.message);
  }
  return created;
}

async function list(user, status) {
  const allowed = ['pending', 'approved', 'rejected'];
  const filter = allowed.includes(status) ? status : undefined;
  if (user.role === 'admin') return repo.list({ status: filter });
  return repo.list({ trainerId: user.id, status: filter });
}

async function getOne(id, user) {
  const s = await repo.findById(id);
  if (!s) throw httpError('ไม่พบข้อเสนอ', 404);
  if (user.role !== 'admin' && s.trainer_id !== user.id) throw httpError('ไม่มีสิทธิ์เข้าถึงข้อเสนอนี้', 403);
  return s;
}

async function review(id, reviewerId, decision, reviewNote) {
  const s = await repo.findById(id);
  if (!s) throw httpError('ไม่พบข้อเสนอ', 404);
  if (s.status !== 'pending') throw httpError('ข้อเสนอนี้ถูกพิจารณาไปแล้ว', 409);

  const note = reviewNote ? String(reviewNote).trim().slice(0, 500) : null;
  const ok = decision === 'approve' ? await repo.approve(id, reviewerId, note) : await repo.reject(id, reviewerId, note);
  if (!ok) throw httpError('ข้อเสนอนี้ถูกพิจารณาไปแล้ว', 409);

  try {
    await notificationService.notify(
      s.trainer_id,
      decision === 'approve' ? '✅ ข้อเสนอแก้ไขท่าได้รับการอนุมัติ' : '❌ ข้อเสนอแก้ไขท่าถูกปฏิเสธ',
      `ท่า "${s.exercise_name}"${note ? ` — ${note}` : ''}`,
      'system',
      s.exercise_id,
    );
  } catch (e) {
    console.error('[suggestion.review] notify failed:', e.message);
  }
  return repo.findById(id);
}

async function withdraw(id, trainerId) {
  const ok = await repo.withdraw(id, trainerId);
  if (!ok) throw httpError('ถอนได้เฉพาะข้อเสนอของตัวเองที่ยังรอการอนุมัติ', 404);
}

async function pendingCount() {
  return repo.countPending();
}

module.exports = { create, list, getOne, review, withdraw, pendingCount, SUGGESTABLE };
