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
  // ลดน้ำหนัก: 4 วัน/สัปดาห์ คาร์ดิโอนำ + strength เบา reps สูง
  lose_weight: [
    { category: 'cardio', target_sets: 3, target_reps: 30, day_of_week: 'Monday', difficulty: 'beginner' },
    { category: 'strength', target_sets: 3, target_reps: 15, day_of_week: 'Monday', difficulty: 'beginner' },
    { category: 'strength', target_sets: 3, target_reps: 15, day_of_week: 'Monday', difficulty: 'beginner' },
    { category: 'cardio', target_sets: 3, target_reps: 30, day_of_week: 'Tuesday', difficulty: 'beginner' },
    { category: 'strength', target_sets: 3, target_reps: 15, day_of_week: 'Tuesday', difficulty: 'beginner' },
    { category: 'cardio', target_sets: 4, target_reps: 30, day_of_week: 'Thursday', difficulty: 'beginner' },
    { category: 'strength', target_sets: 3, target_reps: 15, day_of_week: 'Thursday', difficulty: 'beginner' },
    { category: 'strength', target_sets: 3, target_reps: 15, day_of_week: 'Thursday', difficulty: 'beginner' },
    { category: 'cardio', target_sets: 3, target_reps: 30, day_of_week: 'Saturday', difficulty: 'beginner' },
    { category: 'strength', target_sets: 3, target_reps: 20, day_of_week: 'Saturday', difficulty: 'beginner' },
  ],
  // เพิ่มกล้ามเนื้อ: Push / Pull / Legs สลับ 3 วัน + ท่าเสริม
  build_muscle: [
    { category: 'strength', target_sets: 4, target_reps: 8, day_of_week: 'Monday', difficulty: 'intermediate' },
    { category: 'strength', target_sets: 4, target_reps: 10, day_of_week: 'Monday', difficulty: 'intermediate' },
    { category: 'strength', target_sets: 3, target_reps: 12, day_of_week: 'Monday', difficulty: 'beginner' },
    { category: 'strength', target_sets: 4, target_reps: 8, day_of_week: 'Wednesday', difficulty: 'intermediate' },
    { category: 'strength', target_sets: 4, target_reps: 10, day_of_week: 'Wednesday', difficulty: 'intermediate' },
    { category: 'strength', target_sets: 3, target_reps: 12, day_of_week: 'Wednesday', difficulty: 'beginner' },
    { category: 'strength', target_sets: 4, target_reps: 8, day_of_week: 'Friday', difficulty: 'intermediate' },
    { category: 'strength', target_sets: 4, target_reps: 10, day_of_week: 'Friday', difficulty: 'intermediate' },
    { category: 'strength', target_sets: 3, target_reps: 12, day_of_week: 'Friday', difficulty: 'beginner' },
  ],
  // ฟิตทั่วไป: 3 วัน ผสม strength + cardio
  general: [
    { category: 'strength', target_sets: 3, target_reps: 12, day_of_week: 'Monday', difficulty: 'beginner' },
    { category: 'strength', target_sets: 3, target_reps: 12, day_of_week: 'Monday', difficulty: 'beginner' },
    { category: 'cardio', target_sets: 3, target_reps: 20, day_of_week: 'Monday', difficulty: 'beginner' },
    { category: 'strength', target_sets: 3, target_reps: 12, day_of_week: 'Wednesday', difficulty: 'beginner' },
    { category: 'strength', target_sets: 3, target_reps: 12, day_of_week: 'Wednesday', difficulty: 'beginner' },
    { category: 'cardio', target_sets: 3, target_reps: 20, day_of_week: 'Wednesday', difficulty: 'beginner' },
    { category: 'strength', target_sets: 3, target_reps: 12, day_of_week: 'Friday', difficulty: 'beginner' },
    { category: 'strength', target_sets: 3, target_reps: 12, day_of_week: 'Friday', difficulty: 'beginner' },
    { category: 'cardio', target_sets: 3, target_reps: 20, day_of_week: 'Friday', difficulty: 'beginner' },
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
  const usedByDay = {};

  return template.map((item) => {
    let pool = byCategory[item.category]?.length ? byCategory[item.category] : exercises;
    // ชอบท่าที่ระดับตรงกับ template ก่อน ถ้าไม่มีค่อยใช้ทั้งหมวด
    const leveled = pool.filter((e) => e.difficulty === item.difficulty);
    if (leveled.length >= 3) pool = leveled;

    const key = `${item.category}:${item.difficulty}`;
    const used = (usedByDay[item.day_of_week] = usedByDay[item.day_of_week] || new Set());
    let exercise = null;
    for (let tries = 0; tries < pool.length; tries += 1) {
      const idx = (counters[key] || 0) % pool.length;
      counters[key] = idx + 1;
      if (!used.has(pool[idx].id)) {
        exercise = pool[idx];
        break;
      }
    }
    if (!exercise) exercise = pool[(counters[key] || 0) % pool.length];
    used.add(exercise.id);

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
  const resolvedGoal = TEMPLATES[goal] ? goal : 'general';
  const planId = await repo.createPlanWithDetails(
    userId,
    { goal: resolvedGoal, start_date: toDateString(start), end_date: toDateString(end) },
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

async function logWorkout(userId, planId, logData) {
  const { exerciseId, sets, reps, weightKg } = logData;
  const setsN = parseInt(sets, 10);
  const repsN = parseInt(reps, 10);
  const weightN = weightKg === undefined || weightKg === null || weightKg === '' ? null : parseFloat(weightKg);

  if (!exerciseId || !Number.isInteger(setsN) || setsN < 1 || !Number.isInteger(repsN) || repsN < 1) {
    const err = new Error('กรุณาระบุข้อมูลให้ครบถ้วน (ท่า, เซต ≥ 1, ครั้ง ≥ 1)');
    err.status = 400;
    throw err;
  }
  if (weightN !== null && (Number.isNaN(weightN) || weightN < 0)) {
    const err = new Error('น้ำหนักต้องเป็นตัวเลขไม่ติดลบ');
    err.status = 400;
    throw err;
  }

  // ต้องเป็นแผนปัจจุบันของ user คนนี้เท่านั้น
  const plan = await repo.getCurrentPlan(userId);
  if (!plan || plan.id !== planId) {
    const err = new Error('ไม่พบตารางออกกำลังกายปัจจุบัน');
    err.status = 404;
    throw err;
  }

  const logId = await repo.insertWorkoutLog(planId, exerciseId, setsN, repsN, weightN);
  if (!logId) {
    const err = new Error('ท่านี้ไม่อยู่ในตารางออกกำลังกายปัจจุบัน');
    err.status = 400;
    throw err;
  }
  return { id: logId };
}

module.exports = { generate, getCurrent, logWorkout };
