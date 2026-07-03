/**
 * src/middleware/auth.middleware.js
 * 
 * Middleware สำหรับการยืนยันตัวตนด้วย JWT
 * ใช้กับ Route ที่ต้องการ Authorization
 */

const jwt = require('jsonwebtoken');
const { findUserById } = require('../modules/auth/auth.repository');

/**
 * ตรวจสอบ JWT Token ใน Authorization header
 * ใช้แนบกับ Route ที่ต้อง Login ก่อนเข้า
 * 
 * @example
 * router.get('/protected', authMiddleware, controller)
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token is required',
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ดึงข้อมูล User ปัจจุบัน
    const user = await findUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found or token is invalid',
      });
    }

    // แนบข้อมูล User เข้าไปใน request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired',
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }
    next(error);
  }
};

/**
 * Middleware สำหรับตรวจสอบ Role
 * @param {...string} roles - roles ที่อนุญาต เช่น 'admin', 'user'
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: insufficient permissions',
      });
    }

    next();
  };
};

module.exports = { authMiddleware, requireRole };
