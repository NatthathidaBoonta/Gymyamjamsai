/**
 * exercise.router.js — เส้นทาง URL ของ Exercise module
 * ทุก role ที่ login แล้วดูได้ / เฉพาะ admin จัดการ (สร้าง/แก้/ลบ)
 */

const express = require('express');
const controller = require('./exercise.controller');
const { authenticate, requireRole } = require('../../middleware/auth.middleware');

const router = express.Router();

router.get('/', authenticate, controller.list);
router.get('/:id', authenticate, controller.getOne);
router.post('/', authenticate, requireRole('admin'), controller.create);
router.put('/:id', authenticate, requireRole('admin'), controller.update);
router.delete('/:id', authenticate, requireRole('admin'), controller.remove);

module.exports = router;
