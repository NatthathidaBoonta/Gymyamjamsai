/**
 * dashboard.router.js — เส้นทาง URL ของ Dashboard module
 */

const express = require('express');
const controller = require('./dashboard.controller');
const { authenticate, requireRole } = require('../../middleware/auth.middleware');

const router = express.Router();

router.get('/personal', authenticate, requireRole('member'), controller.personal);
router.get('/admin', authenticate, requireRole('admin'), controller.admin);
router.get('/admin/charts', authenticate, requireRole('admin'), controller.adminCharts);
router.get('/trainer', authenticate, requireRole('trainer'), controller.trainer);

module.exports = router;
