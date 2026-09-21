/**
 * exercise-suggestion.router.js — /api/exercise-suggestions
 *
 * trainer : POST /            เสนอแก้ไขท่า (body: exercise_id + ฟิลด์ที่แก้ + note)
 *           GET  /            ข้อเสนอของตัวเอง
 *           DELETE /:id       ถอนข้อเสนอที่ยัง pending
 * admin   : GET  /            ข้อเสนอทั้งหมด (?status=pending)
 *           GET  /pending-count
 *           POST /:id/approve · POST /:id/reject (body: review_note)
 * ทั้งคู่ : GET  /:id
 */

const express = require('express');
const { authenticate, requireRole } = require('../../middleware/auth.middleware');
const service = require('./exercise-suggestion.service');

const router = express.Router();
router.use(authenticate);

router.get('/', requireRole('trainer', 'admin'), async (req, res, next) => {
  try {
    const data = await service.list(req.user, req.query.status);
    res.json({ status: 'success', message: 'รายการข้อเสนอแก้ไขท่า', data });
  } catch (err) {
    next(err);
  }
});

router.get('/pending-count', requireRole('admin'), async (req, res, next) => {
  try {
    res.json({ status: 'success', message: 'จำนวนข้อเสนอที่รอพิจารณา', data: { count: await service.pendingCount() } });
  } catch (err) {
    next(err);
  }
});

router.post('/', requireRole('trainer'), async (req, res, next) => {
  try {
    const exerciseId = req.body && req.body.exercise_id ? String(req.body.exercise_id) : '';
    if (!exerciseId) {
      const err = new Error('exercise_id จำเป็นต้องระบุ');
      err.status = 400;
      throw err;
    }
    const data = await service.create(exerciseId, req.user.id, req.body);
    res.status(201).json({ status: 'success', message: 'ส่งข้อเสนอแล้ว รอผู้ดูแลระบบอนุมัติ', data });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', requireRole('trainer', 'admin'), async (req, res, next) => {
  try {
    const data = await service.getOne(req.params.id, req.user);
    res.json({ status: 'success', message: 'รายละเอียดข้อเสนอ', data });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/approve', requireRole('admin'), async (req, res, next) => {
  try {
    const data = await service.review(req.params.id, req.user.id, 'approve', req.body && req.body.review_note);
    res.json({ status: 'success', message: 'อนุมัติและอัปเดตท่าแล้ว', data });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/reject', requireRole('admin'), async (req, res, next) => {
  try {
    const data = await service.review(req.params.id, req.user.id, 'reject', req.body && req.body.review_note);
    res.json({ status: 'success', message: 'ปฏิเสธข้อเสนอแล้ว', data });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireRole('trainer'), async (req, res, next) => {
  try {
    await service.withdraw(req.params.id, req.user.id);
    res.json({ status: 'success', message: 'ถอนข้อเสนอแล้ว' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
