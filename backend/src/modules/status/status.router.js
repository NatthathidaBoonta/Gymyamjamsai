/**
 * src/modules/status/status.router.js
 * 
 * Router สำหรับโมดูล Status
 * กำหนด Endpoint ทั้งหมดของ /api/status
 */

const express = require('express');
const { getStatus } = require('./status.controller');

const router = express.Router();

/**
 * GET /api/status
 * @desc  ตรวจสอบสถานะการทำงานของ API
 * @access Public
 */
router.get('/', getStatus);

module.exports = router;
