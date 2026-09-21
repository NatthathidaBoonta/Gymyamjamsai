const express = require('express');
const { authenticate, requireRole } = require('../../middleware/auth.middleware');
const userController = require('./user.controller');

const router = express.Router();

// ทุก route ใน module นี้ต้องล็อคอิน
router.use(authenticate);

// --- User Profile Routes ---
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);

// --- Admin User Management Routes ---
router.get('/admin', requireRole('admin'), userController.getAllUsers);
router.post('/admin', requireRole('admin'), userController.createUser);
router.put('/admin/:id', requireRole('admin'), userController.updateUser);

module.exports = router;
