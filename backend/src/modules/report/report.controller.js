/**
 * report.controller.js — ส่งไฟล์ CSV เป็น response (attachment)
 */

const dto = require('./report.dto');
const service = require('./report.service');

// BOM สำหรับ UTF-8 เพื่อให้ Excel เปิดภาษาไทยได้ถูกต้อง
const UTF8_BOM = '﻿';

// GET /api/reports/activities/export (admin, trainer)
async function activitiesExport(req, res, next) {
  try {
    const { month, year } = dto.parseMonthYear(req.query);
    const { csv } = await service.activitiesCsv({
      role: req.user.role,
      userId: req.user.id,
      month,
      year,
    });

    const filename = `activity-attendance-${year || 'all'}-${month || 'all'}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(UTF8_BOM + csv);
  } catch (err) {
    next(err);
  }
}

module.exports = { activitiesExport };
