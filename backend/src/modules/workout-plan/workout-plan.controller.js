/**
 * workout-plan.controller.js — รับ req/res, เรียก service, ตอบตาม standard envelope
 * user id มาจาก JWT (req.user.id) เสมอ — กัน IDOR ตามหลัก PDPA ใน 05-database-design.md
 */

const dto = require('./workout-plan.dto');
const service = require('./workout-plan.service');

// POST /api/workout-plans/generate
async function generate(req, res, next) {
  try {
    const { goal } = dto.parseGenerateInput(req.body);
    const data = await service.generate(req.user.id, { goal });
    res.status(201).json({ status: 'success', message: 'สร้างตารางออกกำลังกายสำเร็จ', data });
  } catch (err) {
    next(err);
  }
}

// GET /api/workout-plans/current
async function current(req, res, next) {
  try {
    const data = await service.getCurrent(req.user.id);
    res.status(200).json({ status: 'success', message: 'ตารางออกกำลังกายปัจจุบัน', data });
  } catch (err) {
    next(err);
  }
}

module.exports = { generate, current };
