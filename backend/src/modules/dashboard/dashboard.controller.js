/**
 * dashboard.controller.js — รับ req/res, เรียก service, ตอบตาม standard envelope
 */

const dto = require('./dashboard.dto');
const service = require('./dashboard.service');

// GET /api/dashboard/personal (member) — user id จาก JWT (กัน IDOR)
async function personal(req, res, next) {
  try {
    const range = dto.parseDateRange(req.query);
    const data = await service.personal(req.user.id, range);
    res.status(200).json({ status: 'success', message: 'สถิติพัฒนาการส่วนตัว', data });
  } catch (err) {
    next(err);
  }
}

// GET /api/dashboard/admin (admin)
async function admin(req, res, next) {
  try {
    const data = await service.admin();
    res.status(200).json({ status: 'success', message: 'ภาพรวมระบบ', data });
  } catch (err) {
    next(err);
  }
}

module.exports = { personal, admin };
