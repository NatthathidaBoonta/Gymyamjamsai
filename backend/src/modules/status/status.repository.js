/**
 * src/modules/status/status.repository.js
 *
 * Repository สำหรับโมดูล Status
 * ทำหน้าที่ตรวจสอบการเชื่อมต่อกับ Database
 */

const pool = require('../../database');

/**
 * ตรวจสอบการเชื่อมต่อ Database
 * @returns {Promise<{connected: boolean, error?: string}>}
 */
const checkDatabaseConnection = async () => {
  try {
    await pool.query('SELECT 1');
    return { connected: true };
  } catch (error) {
    return { connected: false, error: error.message };
  }
};

module.exports = { checkDatabaseConnection };
