/**
 * notification.router.js — Routes สำหรับ Notifications
 */

const { Router } = require('express');
const { authenticate } = require('../../middleware/auth.middleware');
const controller = require('./notification.controller');

const router = Router();

// ต้องเข้าสู่ระบบ
router.use(authenticate);

// GET /api/notifications
router.get('/', controller.list);

// GET /api/notifications/unread-count
router.get('/unread-count', controller.getUnreadCount);

// PATCH /api/notifications/:id/read
router.patch('/:id/read', controller.markAsRead);

// POST /api/notifications/read-all
router.post('/read-all', controller.markAllAsRead);

// DELETE /api/notifications/:id
router.delete('/:id', controller.remove);

module.exports = router;
