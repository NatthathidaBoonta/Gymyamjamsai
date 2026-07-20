/**
 * workout-plan.repository.js — Data access layer สำหรับแผนออกกำลังกาย
 */

const crypto = require('crypto');
const { pool } = require('../../database');

/**
 * ดึงท่าทั้งหมด (ใช้ประกอบ Static Template)
 */
async function listExercises() {
  const [rows] = await pool.query('SELECT id, name, category FROM exercises ORDER BY name');
  return rows;
}

/**
 * สร้างแผน + รายละเอียดแบบ Transaction (atomic)
 * - ตั้งแผน active เดิมของ user เป็น 'adjusted' ก่อน (ให้ current คืนแผนล่าสุด)
 * - ใช้ getConnection + try/finally release กัน connection ค้าง (ความเสี่ยง Phase 3)
 * @returns {string} planId ที่สร้าง
 */
async function createPlanWithDetails(userId, plan, details) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      "UPDATE workout_plans SET status = 'adjusted' WHERE user_id = ? AND status = 'active'",
      [userId],
    );

    const planId = crypto.randomUUID();
    await conn.query(
      'INSERT INTO workout_plans (id, user_id, status, start_date, end_date) VALUES (?, ?, ?, ?, ?)',
      [planId, userId, 'active', plan.start_date, plan.end_date],
    );

    for (const d of details) {
      await conn.query(
        `INSERT INTO workout_plan_details
           (id, plan_id, exercise_id, target_sets, target_reps, target_weight, day_of_week)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          crypto.randomUUID(),
          planId,
          d.exercise_id,
          d.target_sets,
          d.target_reps,
          null,
          d.day_of_week,
        ],
      );
    }

    await conn.commit();
    return planId;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * ดึงแผนที่ active ล่าสุดของ user พร้อมรายละเอียดท่า (join ชื่อท่า)
 */
async function getCurrentPlan(userId) {
  const [plans] = await pool.query(
    `SELECT id, status, start_date, end_date, created_at
     FROM workout_plans WHERE user_id = ? AND status = 'active'
     ORDER BY created_at DESC LIMIT 1`,
    [userId],
  );
  if (!plans.length) return null;

  const plan = plans[0];
  const [details] = await pool.query(
    `SELECT d.id, d.exercise_id, e.name AS exercise_name, e.category,
            d.target_sets, d.target_reps, d.target_weight, d.day_of_week
     FROM workout_plan_details d
     JOIN exercises e ON e.id = d.exercise_id
     WHERE d.plan_id = ? ORDER BY d.created_at`,
    [plan.id],
  );
  return { ...plan, details };
}

module.exports = { listExercises, createPlanWithDetails, getCurrentPlan };
