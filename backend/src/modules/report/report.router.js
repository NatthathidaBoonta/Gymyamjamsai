/**
 * report.router.js — เส้นทาง URL ของ Report module
 */

const express = require('express');
const controller = require('./report.controller');
const { authenticate, requireRole } = require('../../middleware/auth.middleware');

const router = express.Router();

// admin เห็นทั้งหมด / trainer เห็นเฉพาะกิจกรรมของตนเอง (แยกใน service)
router.get(
  '/activities/export',
  authenticate,
  requireRole('admin', 'trainer'),
  controller.activitiesExport,
);

module.exports = router;
