/**
 * src/modules/status/status.service.js
 * 
 * Service สำหรับโมดูล Status
 * รวบรวม Business Logic ในการตรวจสอบสถานะระบบ
 */

const { checkDatabaseConnection } = require('./status.repository');

/**
 * ดึงข้อมูลสถานะของระบบทั้งหมด
 * @returns {Promise<Object>}
 */
const getSystemStatus = async () => {
  const dbStatus = await checkDatabaseConnection();

  return {
    status: 'ok',
    message: 'Gymyamjamsai API is running',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: Math.floor(process.uptime()),
    database: {
      connected: dbStatus.connected,
      provider: 'sqlite (Prisma)',
      error: dbStatus.error || null,
    },
  };
};

module.exports = { getSystemStatus };
