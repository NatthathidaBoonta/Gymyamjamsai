/**
 * src/middleware/error.middleware.js
 *
 * Central Error Handling — Phase 3
 * รวมการจัดการ error ไว้ที่เดียว เพื่อให้ทุก route คืน response รูปแบบเดียวกัน
 */

/**
 * 404 handler — ทำงานเมื่อไม่มี route ใดตรงกับ request
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    status: 'error',
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    code: 404,
  });
}

/**
 * Central error handler — ต้องมี 4 พารามิเตอร์ Express ถึงจะรู้ว่าเป็น error middleware
 * (_next ไม่ได้ใช้ แต่ต้องคงไว้ให้ครบ signature)
 * รูปแบบ response ตาม standard error structure ใน docs/planning/06-api-contract.md
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  const status = err.status || 500;
  console.error(`[Error] ${status} ${req.method} ${req.originalUrl}: ${err.message}`);
  res.status(status).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    code: status,
  });
}

module.exports = { notFoundHandler, errorHandler };
