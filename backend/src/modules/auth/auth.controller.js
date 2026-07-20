/**
 * auth.controller.js — รับ req/res, เรียก service, ตอบกลับตาม standard envelope
 * (โครงสร้าง { status, message, data } ตาม docs/planning/06-api-contract.md)
 */

const dto = require('./auth.dto');
const service = require('./auth.service');

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const creds = dto.validateRegister(req.body);
    const data = await service.register(creds);
    res.status(201).json({ status: 'success', message: 'สมัครสมาชิกสำเร็จ', data });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const creds = dto.validateLogin(req.body);
    const data = await service.login(creds);
    res.status(200).json({ status: 'success', message: 'เข้าสู่ระบบสำเร็จ', data });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me — คืนข้อมูลผู้ใช้จาก token (ต้องผ่าน authenticate ก่อน)
function me(req, res) {
  res.status(200).json({
    status: 'success',
    message: 'ข้อมูลผู้ใช้ปัจจุบัน',
    data: { user_id: req.user.id, role: req.user.role },
  });
}

module.exports = { register, login, me };
