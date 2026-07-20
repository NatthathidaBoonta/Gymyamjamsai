/**
 * auth.router.js — เส้นทาง URL ของ Auth module
 */

const express = require('express');
const controller = require('./auth.controller');
const { authenticate } = require('../../middleware/auth.middleware');

const router = express.Router();

router.post('/register', controller.register); // สมัครสมาชิก (Guest)
router.post('/login', controller.login); // เข้าสู่ระบบ (Guest)
router.get('/me', authenticate, controller.me); // ข้อมูลผู้ใช้ปัจจุบัน (ต้องมี token)

module.exports = router;
