/**
 * src/modules/profile/profile.router.js
 *
 * Router สำหรับโมดูล Profile
 * กำหนด Endpoint ทั้งหมดของ /api/profile
 */

const express = require('express');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { getMyProfileController, saveMyProfileController } = require('./profile.controller');

const router = express.Router();

/**
 * GET /api/profile/me
 * @desc  ดึง Profile ของ User ปัจจุบัน
 * @access Private
 */
router.get('/me', authMiddleware, getMyProfileController);

/**
 * PUT /api/profile/me
 * @desc  บันทึก Profile ของ User ปัจจุบัน (onboarding / edit)
 * @access Private
 */
router.put('/me', authMiddleware, saveMyProfileController);

module.exports = router;
