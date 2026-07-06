/**
 * src/modules/workout-plan/workout-plan.repository.js
 *
 * Repository สำหรับโมดูล Workout Plan (ตารางออกกำลังกาย)
 * จัดการ Database Operations ผ่าน mysql2 (raw SQL)
 *
 * แต่ละ user มีตารางออกกำลังกายเดียว (auto-create ตอนใช้งานครั้งแรก)
 * ประกอบด้วยรายการท่าออกกำลังกาย (plan_details) ที่กำหนดวันในสัปดาห์ให้แต่ละท่า
 */

const { v4: uuidv4 } = require('uuid');
const pool = require('../../database');

const PLAN_FIELDS = `id, user_id AS userId, name, start_date AS startDate, status,
                     created_at AS createdAt, updated_at AS updatedAt`;

const DETAIL_FIELDS = `pd.id, pd.plan_id AS planId, pd.exercise_id AS exerciseId, pd.sets, pd.reps,
                        pd.weight_kg AS weightKg, pd.day_of_week AS dayOfWeek, pd.created_at AS createdAt,
                        e.name AS exerciseName, e.target_muscle AS targetMuscle, e.equipment,
                        e.category, e.difficulty, e.media_url AS mediaUrl`;

const DAY_ORDER = "FIELD(pd.day_of_week, 'monday','tuesday','wednesday','thursday','friday','saturday','sunday')";

/**
 * ดึงตารางออกกำลังกายของ user ถ้ายังไม่มีจะสร้างให้ใหม่
 * @param {string} userId
 * @returns {Promise<Object>} plan
 */
const findOrCreatePlan = async (userId) => {
  const [rows] = await pool.query(`SELECT ${PLAN_FIELDS} FROM workout_plans WHERE user_id = ? LIMIT 1`, [userId]);
  if (rows[0]) return rows[0];

  const id = uuidv4();
  await pool.query(
    `INSERT INTO workout_plans (id, user_id, name, start_date, status) VALUES (?, ?, ?, CURDATE(), 'active')`,
    [id, userId, 'ตารางของฉัน']
  );
  const [created] = await pool.query(`SELECT ${PLAN_FIELDS} FROM workout_plans WHERE id = ?`, [id]);
  return created[0];
};

/**
 * ดึงรายการท่าออกกำลังกายทั้งหมดในตาราง เรียงตามวันในสัปดาห์
 * @param {string} planId
 * @returns {Promise<Object[]>}
 */
const findDetailsByPlanId = async (planId) => {
  const [rows] = await pool.query(
    `SELECT ${DETAIL_FIELDS} FROM plan_details pd
     JOIN exercises e ON e.id = pd.exercise_id
     WHERE pd.plan_id = ?
     ORDER BY ${DAY_ORDER}, pd.created_at ASC`,
    [planId]
  );
  return rows;
};

/**
 * ค้นหาท่าในตารางด้วย ID
 * @param {string} detailId
 * @returns {Promise<Object|null>}
 */
const findDetailById = async (detailId) => {
  const [rows] = await pool.query(
    `SELECT ${DETAIL_FIELDS} FROM plan_details pd
     JOIN exercises e ON e.id = pd.exercise_id
     WHERE pd.id = ? LIMIT 1`,
    [detailId]
  );
  return rows[0] || null;
};

/**
 * เพิ่มท่าออกกำลังกายลงในตาราง
 * @param {string} planId
 * @param {{ exerciseId: string, dayOfWeek: string, sets?: number, reps?: number, weightKg?: number }} data
 * @returns {Promise<string>} detailId ที่สร้างขึ้น
 */
const addDetail = async (planId, { exerciseId, dayOfWeek, sets, reps, weightKg }) => {
  const id = uuidv4();
  await pool.query(
    `INSERT INTO plan_details (id, plan_id, exercise_id, sets, reps, weight_kg, day_of_week)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, planId, exerciseId, sets || null, reps || null, weightKg || null, dayOfWeek]
  );
  return id;
};

/**
 * แก้ไขท่าออกกำลังกายในตาราง (วัน/เซต/ครั้ง/น้ำหนัก)
 * @param {string} detailId
 * @param {{ dayOfWeek: string, sets?: number, reps?: number, weightKg?: number }} data
 */
const updateDetail = async (detailId, { dayOfWeek, sets, reps, weightKg }) => {
  await pool.query(
    `UPDATE plan_details SET day_of_week = ?, sets = ?, reps = ?, weight_kg = ? WHERE id = ?`,
    [dayOfWeek, sets || null, reps || null, weightKg || null, detailId]
  );
};

/**
 * ลบท่าออกกำลังกายออกจากตาราง
 * @param {string} detailId
 */
const removeDetail = async (detailId) => {
  await pool.query('DELETE FROM plan_details WHERE id = ?', [detailId]);
};

module.exports = { findOrCreatePlan, findDetailsByPlanId, findDetailById, addDetail, updateDetail, removeDetail };
