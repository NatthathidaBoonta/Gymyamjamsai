/**
 * activity.router.js — เส้นทาง URL ของ Activity module
 */

const express = require('express');
const controller = require('./activity.controller');
const { authenticate, requireRole } = require('../../middleware/auth.middleware');

const router = express.Router();

router.get('/', authenticate, controller.list); // ทุก role ที่ login แล้ว
router.post('/', authenticate, requireRole('trainer'), controller.create); // trainer สร้างคลาส
router.put('/:id', authenticate, requireRole('trainer'), controller.update); // trainer แก้ไขคลาสตัวเอง
router.delete('/:id', authenticate, requireRole('trainer'), controller.remove); // trainer ยกเลิกคลาสตัวเอง
router.post('/:id/register', authenticate, requireRole('member'), controller.register); // member จอง
router.delete('/:id/register', authenticate, requireRole('member'), controller.unregister); // member ยกเลิกจอง
router.get('/:id/participants', authenticate, requireRole('trainer'), controller.participants); // trainer ดูรายชื่อ
router.patch('/:id/attendance', authenticate, requireRole('trainer'), controller.attendance); // trainer เช็คชื่อ

// Phase 16: คอร์สแบบต้องอนุมัติ — trainer เจ้าของอนุมัติ/ปฏิเสธผู้สมัคร (การปิดคอร์สใช้ DELETE /:id)
router.patch('/:id/participants/:userId/approve', authenticate, requireRole('trainer'), controller.approveParticipant);
router.patch('/:id/participants/:userId/reject', authenticate, requireRole('trainer'), controller.rejectParticipant);

module.exports = router;
