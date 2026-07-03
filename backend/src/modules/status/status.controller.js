/**
 * src/modules/status/status.controller.js
 * 
 * Controller สำหรับโมดูล Status
 * รับ HTTP Request และส่ง Response กลับ
 */

const { getSystemStatus } = require('./status.service');
const { statusResponseDto } = require('./status.dto');

/**
 * GET /api/status
 * คืนค่าสถานะการทำงานของ API และ Database
 */
const getStatus = async (req, res, next) => {
  try {
    const statusData = await getSystemStatus();
    const response = statusResponseDto(statusData);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

module.exports = { getStatus };
