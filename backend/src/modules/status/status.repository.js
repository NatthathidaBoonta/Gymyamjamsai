/**
 * src/modules/status/status.repository.js
 * 
 * Repository สำหรับโมดูล Status
 * ทำหน้าที่ตรวจสอบการเชื่อมต่อกับ Database
 */

const prisma = require('../../database');

/**
 * ตรวจสอบการเชื่อมต่อ Database
 * @returns {Promise<{connected: boolean, error?: string}>}
 */
const checkDatabaseConnection = async () => {
  try {
    // ส่ง raw query เบาๆ เพื่อเช็กการเชื่อมต่อ
    await prisma.$queryRaw`SELECT 1`;
    return { connected: true };
  } catch (error) {
    return { connected: false, error: error.message };
  }
};

module.exports = { checkDatabaseConnection };
