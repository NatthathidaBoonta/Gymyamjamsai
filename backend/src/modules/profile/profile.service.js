/**
 * src/modules/profile/profile.service.js
 *
 * Service สำหรับโมดูล Profile
 * รวบรวม Business Logic ของข้อมูลร่างกาย/เป้าหมายของผู้ใช้
 */

const { findByUserId, upsertProfile } = require('./profile.repository');

/**
 * ดึง Profile ของ User ปัจจุบัน
 * @param {string} userId
 * @returns {Promise<Object|null>}
 */
const getProfile = async (userId) => {
  return findByUserId(userId);
};

/**
 * บันทึก (สร้าง/แก้ไข) Profile ของ User ปัจจุบัน
 * @param {string} userId
 * @param {Object} data
 * @returns {Promise<Object>}
 */
const saveProfile = async (userId, data) => {
  return upsertProfile(userId, data);
};

module.exports = { getProfile, saveProfile };
