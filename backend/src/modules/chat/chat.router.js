/**
 * chat.router.js — /api/chat/activities/:activityId/...
 */

const express = require('express');
const { authenticate, requireRole } = require('../../middleware/auth.middleware');
const controller = require('./chat.controller');

const router = express.Router();

router.get('/activities/:activityId', authenticate, requireRole('member', 'trainer'), controller.room);
router.get('/activities/:activityId/messages', authenticate, requireRole('member', 'trainer'), controller.messages);
router.post('/activities/:activityId/messages', authenticate, requireRole('member', 'trainer'), controller.send);

module.exports = router;
