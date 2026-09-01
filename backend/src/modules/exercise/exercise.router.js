/**
 * exercise.router.js — เส้นทาง URL ของ Exercise module
 * ดูได้แม้ไม่ login (ไลบรารีท่าเป็นหน้าโชว์สาธารณะ) / เฉพาะ admin จัดการ (สร้าง/แก้/ลบ)
 */

const express = require('express');
const controller = require('./exercise.controller');
const { authenticate, requireRole } = require('../../middleware/auth.middleware');

const router = express.Router();

router.get('/', controller.list);
router.get('/:id', controller.getOne);
router.post('/', authenticate, requireRole('admin'), controller.create);
router.put('/:id', authenticate, requireRole('admin'), controller.update);
router.delete('/:id', authenticate, requireRole('admin'), controller.remove);

module.exports = router;
