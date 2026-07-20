/**
 * activity.router.js — เส้นทาง URL ของ Activity module
 */

const express = require('express');
const controller = require('./activity.controller');
const { authenticate, requireRole } = require('../../middleware/auth.middleware');

const router = express.Router();

router.get('/', authenticate, controller.list); // ทุก role ที่ login แล้ว
router.post('/', authenticate, requireRole('trainer'), controller.create); // trainer สร้างคลาส
router.post('/:id/register', authenticate, requireRole('member'), controller.register); // member จอง
router.get('/:id/participants', authenticate, requireRole('trainer'), controller.participants); // trainer ดูรายชื่อ
router.patch('/:id/attendance', authenticate, requireRole('trainer'), controller.attendance); // trainer เช็คชื่อ

module.exports = router;
