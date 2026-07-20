/**
 * workout-plan.service.js — Business logic: สร้างตารางออกกำลังกายด้วย Static Template
 *
 * ตามข้อสรุปใน docs/planning/11-plan-Implementation.md:
 * เฟสแรกใช้ "Static Template" (ตารางสำเร็จรูปตามเป้าหมาย) ไม่ทำ algorithm สุ่มซับซ้อน
 */

const repo = require('./workout-plan.repository');

// ระยะเวลาแผนเริ่มต้น (วัน)
const PLAN_DURATION_DAYS = 28;

/**
 * Static Template แยกตามเป้าหมาย — แต่ละรายการอ้างอิง "category" ของท่า
 * แล้ว service จะจับคู่กับท่าจริงในคลัง (round-robin) ตอน generate
 */
const TEMPLATES = {
  lose_weight: [
    { category: 'cardio', target_sets: 3, target_reps: 20, day_of_week: 'Monday' },
    { category: 'strength', target_sets: 3, target_reps: 15, day_of_week: 'Monday' },
    { category: 'cardio', target_sets: 3, target_reps: 20, day_of_week: 'Wednesday' },
    { category: 'strength', target_sets: 3, target_reps: 15, day_of_week: 'Friday' },
  ],
  build_muscle: [
    { category: 'strength', target_sets: 4, target_reps: 8, day_of_week: 'Monday' },
    { category: 'strength', target_sets: 4, target_reps: 10, day_of_week: 'Wednesday' },
    { category: 'strength', target_sets: 4, target_reps: 12, day_of_week: 'Friday' },
  ],
  general: [
    { category: 'strength', target_sets: 3, target_reps: 12, day_of_week: 'Monday' },
    { category: 'cardio', target_sets: 3, target_reps: 15, day_of_week: 'Wednesday' },
    { category: 'strength', target_sets: 3, target_reps: 12, day_of_week: 'Friday' },
  ],
};

function toDateString(date) {
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
}

/**
 * จับคู่แต่ละรายการใน template กับท่าจริงในคลัง
 * - เลือกท่าตาม category (ถ้าไม่มี category นั้น ใช้ท่าใดก็ได้)
 * - ใช้ round-robin เพื่อกระจายท่าไม่ให้ซ้ำท่าเดิมทุกช่อง
 */
function buildDetails(template, exercises) {
  const byCategory = {};
  for (const ex of exercises) {
    const key = ex.category || 'other';
    (byCategory[key] = byCategory[key] || []).push(ex);
  }
  const counters = {};

  return template.map((item) => {
    const candidates = byCategory[item.category]?.length ? byCategory[item.category] : exercises;
    const idx = (counters[item.category] || 0) % candidates.length;
    counters[item.category] = idx + 1;
    const exercise = candidates[idx];
    return {
      exercise_id: exercise.id,
      target_sets: item.target_sets,
      target_reps: item.target_reps,
      day_of_week: item.day_of_week,
    };
  });
}

/**
 * สร้างตารางออกกำลังกายให้ member
 * @returns แผนปัจจุบันที่เพิ่งสร้าง (พร้อมรายละเอียด)
 */
async function generate(userId, { goal }) {
  const exercises = await repo.listExercises();
  if (exercises.length === 0) {
    const err = new Error('ยังไม่มีท่าออกกำลังกายในระบบ ไม่สามารถสร้างตารางได้');
    err.status = 409;
    throw err;
  }

  const template = TEMPLATES[goal] || TEMPLATES.general;
  const details = buildDetails(template, exercises);

  const start = new Date();
  const end = new Date(start.getTime() + PLAN_DURATION_DAYS * 24 * 60 * 60 * 1000);
  const planId = await repo.createPlanWithDetails(
    userId,
    { start_date: toDateString(start), end_date: toDateString(end) },
    details,
  );

  return { plan_id: planId, ...(await repo.getCurrentPlan(userId)) };
}

/**
 * ดึงตารางปัจจุบัน — ถ้ายังไม่มี โยน 404
 */
async function getCurrent(userId) {
  const plan = await repo.getCurrentPlan(userId);
  if (!plan) {
    const err = new Error('ยังไม่มีตารางออกกำลังกาย กรุณาสร้างตารางก่อน');
    err.status = 404;
    throw err;
  }
  return plan;
}

module.exports = { generate, getCurrent };
