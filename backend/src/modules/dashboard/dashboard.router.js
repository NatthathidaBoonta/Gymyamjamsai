/**
 * dashboard.router.js — เส้นทาง URL ของ Dashboard module
 */

const express = require('express');
const controller = require('./dashboard.controller');
const { authenticate, requireRole } = require('../../middleware/auth.middleware');

const router = express.Router();

router.get('/personal', authenticate, requireRole('member'), controller.personal);
router.get('/admin', authenticate, requireRole('admin'), controller.admin);

module.exports = router;
