const express = require('express');
const { authenticate } = require('../../middleware/auth.middleware');
const userController = require('./user.controller');

const router = express.Router();

// ทุก route ใน module นี้ต้องล็อคอิน
router.use(authenticate);

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);

module.exports = router;
