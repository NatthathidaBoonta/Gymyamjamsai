/**
 * src/modules/status/status.dto.js
 * 
 * DTO (Data Transfer Object) สำหรับโมดูล Status
 * กำหนดรูปแบบข้อมูลที่ Response ส่งออกไป
 */

/**
 * สร้าง Response object สำหรับ Status
 * @param {Object} data
 * @returns {Object}
 */
const statusResponseDto = (data) => ({
  success: true,
  status: data.status,
  message: data.message,
  timestamp: data.timestamp,
  version: data.version,
  environment: data.environment,
  uptime: data.uptime,
  database: data.database,
});

module.exports = { statusResponseDto };
