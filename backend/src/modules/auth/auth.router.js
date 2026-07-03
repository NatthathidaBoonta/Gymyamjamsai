/**
 * src/modules/auth/auth.router.js
 * 
 * Router สำหรับโมดูล Auth
 * กำหนด Endpoint ทั้งหมดของ /api/auth
 */

const express = require('express');
const { registerController, loginController } = require('./auth.controller');

const router = express.Router();

/**
 * POST /api/auth/register
 * @desc  สมัครสมาชิกใหม่
 * @access Public
 */
router.post('/register', registerController);

/**
 * POST /api/auth/login
 * @desc  เข้าสู่ระบบและรับ JWT Token
 * @access Public
 */
router.post('/login', loginController);

module.exports = router;
