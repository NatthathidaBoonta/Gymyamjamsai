/**
 * activity.controller.js — รับ req/res, เรียก service, ตอบตาม standard envelope
 * user id มาจาก JWT (req.user.id) เสมอ
 */

const dto = require('./activity.dto');
const service = require('./activity.service');

// GET /api/activities
async function list(req, res, next) {
  try {
    const data = await service.list(req.user.id);
    res.status(200).json({ status: 'success', message: 'รายการกิจกรรม', data });
  } catch (err) {
    next(err);
  }
}

// POST /api/activities (trainer)
async function create(req, res, next) {
  try {
    const payload = dto.validateCreate(req.body);
    const data = await service.create(req.user.id, payload);
    res.status(201).json({ status: 'success', message: 'สร้างกิจกรรมสำเร็จ', data });
  } catch (err) {
    next(err);
  }
}

// PUT /api/activities/:id (trainer เจ้าของ)
async function update(req, res, next) {
  try {
    const payload = dto.validateCreate(req.body);
    const data = await service.update(req.params.id, req.user.id, payload);
    res.status(200).json({ status: 'success', message: 'แก้ไขกิจกรรมสำเร็จ', data });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/activities/:id (trainer เจ้าของ) — ยกเลิกกิจกรรม
async function remove(req, res, next) {
  try {
    const data = await service.cancel(req.params.id, req.user.id);
    res.status(200).json({ status: 'success', message: 'ยกเลิกกิจกรรมสำเร็จ', data });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/activities/:id/register (member) — ยกเลิกการจองของตัวเอง
async function unregister(req, res, next) {
  try {
    const data = await service.cancelRegistration(req.params.id, req.user.id);
    res.status(200).json({ status: 'success', message: 'ยกเลิกการลงทะเบียนสำเร็จ', data });
  } catch (err) {
    next(err);
  }
}

// POST /api/activities/:id/register (member)
async function register(req, res, next) {
  try {
    const data = await service.register(req.params.id, req.user.id);
    res.status(201).json({ status: 'success', message: 'ลงทะเบียนกิจกรรมสำเร็จ', data });
  } catch (err) {
    next(err);
  }
}

// GET /api/activities/:id/participants (trainer เจ้าของ)
async function participants(req, res, next) {
  try {
    const data = await service.getParticipants(req.params.id, req.user.id);
    res.status(200).json({ status: 'success', message: 'รายชื่อผู้ลงทะเบียน', data });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/activities/:id/attendance (trainer เจ้าของ)
async function attendance(req, res, next) {
  try {
    const payload = dto.validateAttendance(req.body);
    const data = await service.markAttendance(req.params.id, req.user.id, payload);
    res.status(200).json({ status: 'success', message: 'บันทึกการเช็คชื่อสำเร็จ', data });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/activities/:id/participants/:userId/approve|reject (trainer เจ้าของ)
function review(decision) {
  return async (req, res, next) => {
    try {
      const data = await service.reviewParticipant(req.params.id, req.user.id, req.params.userId, decision);
      res.status(200).json({
        status: 'success',
        message: decision === 'approve' ? 'อนุมัติผู้สมัครแล้ว' : 'ปฏิเสธผู้สมัครแล้ว',
        data,
      });
    } catch (err) {
      next(err);
    }
  };
}

module.exports = {
  list,
  create,
  register,
  participants,
  attendance,
  update,
  remove,
  unregister,
  approveParticipant: review('approve'),
  rejectParticipant: review('reject'),
};
