/**
 * auth.middleware.js — JWT Authentication & Role-based Authorization
 *
 * authenticate  : ตรวจ JWT จาก header `Authorization: Bearer <token>` → set req.user
 * requireRole   : ใช้ต่อจาก authenticate เพื่อจำกัดสิทธิ์ตาม role (คืน 403 ถ้าไม่ผ่าน)
 */

const jwt = require('jsonwebtoken');

function httpError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

/**
 * ตรวจสอบ JWT — ถ้าไม่มี token หรือ token ไม่ถูกต้อง → 401
 */
function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(httpError('ไม่พบ token หรือรูปแบบไม่ถูกต้อง', 401));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    next(httpError('token ไม่ถูกต้องหรือหมดอายุ', 401));
  }
}

/**
 * จำกัดสิทธิ์ตาม role — เช่น requireRole('trainer'), requireRole('admin', 'trainer')
 * ต้องใช้ต่อจาก authenticate เสมอ
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return next(httpError('ต้องเข้าสู่ระบบก่อน', 401));
    if (!allowedRoles.includes(req.user.role)) {
      return next(httpError('ไม่มีสิทธิ์เข้าถึงทรัพยากรนี้', 403));
    }
    next();
  };
}

module.exports = { authenticate, requireRole };
