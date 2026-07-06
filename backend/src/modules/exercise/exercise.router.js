/**
 * src/modules/exercise/exercise.router.js
 *
 * Router สำหรับโมดูล Exercise
 * กำหนด Endpoint ทั้งหมดของ /api/exercises
 * การอ่าน (GET) เปิดให้ user ทุกคนที่ login แล้ว, การแก้ไข (POST/PUT/DELETE) จำกัดเฉพาะ admin
 */

const express = require('express');
const { authMiddleware, requireRole } = require('../../middleware/auth.middleware');
const controller = require('./exercise.controller');

const router = express.Router();

router.get('/', authMiddleware, controller.listController);
router.get('/:id', authMiddleware, controller.getByIdController);
router.post('/', authMiddleware, requireRole('admin'), controller.createController);
router.put('/:id', authMiddleware, requireRole('admin'), controller.updateController);
router.delete('/:id', authMiddleware, requireRole('admin'), controller.deleteController);

module.exports = router;
