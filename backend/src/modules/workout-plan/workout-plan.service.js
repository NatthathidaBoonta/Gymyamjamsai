/**
 * src/modules/workout-plan/workout-plan.service.js
 *
 * Service สำหรับโมดูล Workout Plan
 */

const repository = require('./workout-plan.repository');

/**
 * ดึงตารางออกกำลังกายของ user พร้อมรายการท่าทั้งหมด
 * @param {string} userId
 * @returns {Promise<Object>}
 */
const getMyPlan = async (userId) => {
  const plan = await repository.findOrCreatePlan(userId);
  const details = await repository.findDetailsByPlanId(plan.id);
  return { ...plan, details };
};

/**
 * เพิ่มท่าออกกำลังกายลงในตารางของ user (สร้างตารางให้อัตโนมัติถ้ายังไม่มี)
 * @param {string} userId
 * @param {Object} data
 * @returns {Promise<Object>}
 */
const addExerciseToPlan = async (userId, data) => {
  const plan = await repository.findOrCreatePlan(userId);
  const detailId = await repository.addDetail(plan.id, data);
  return repository.findDetailById(detailId);
};

/**
 * ตรวจสอบว่าท่าในตารางนี้เป็นของ user ที่ร้องขอจริง (ป้องกันแก้ไข/ลบข้ามบัญชี)
 * @param {string} userId
 * @param {string} detailId
 * @returns {Promise<Object>} detail
 */
const ensureDetailOwnership = async (userId, detailId) => {
  const plan = await repository.findOrCreatePlan(userId);
  const detail = await repository.findDetailById(detailId);
  if (!detail || detail.planId !== plan.id) {
    const error = new Error('Plan exercise not found');
    error.statusCode = 404;
    throw error;
  }
  return detail;
};

/**
 * แก้ไขท่าออกกำลังกายในตาราง
 * @param {string} userId
 * @param {string} detailId
 * @param {Object} data
 * @returns {Promise<Object>}
 */
const updatePlanExercise = async (userId, detailId, data) => {
  await ensureDetailOwnership(userId, detailId);
  await repository.updateDetail(detailId, data);
  return repository.findDetailById(detailId);
};

/**
 * ลบท่าออกกำลังกายออกจากตาราง
 * @param {string} userId
 * @param {string} detailId
 */
const removePlanExercise = async (userId, detailId) => {
  await ensureDetailOwnership(userId, detailId);
  await repository.removeDetail(detailId);
};

module.exports = { getMyPlan, addExerciseToPlan, updatePlanExercise, removePlanExercise };
