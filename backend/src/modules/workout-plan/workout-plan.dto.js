/**
 * workout-plan.dto.js — Validation สำหรับ Workout Plan module
 */

// เป้าหมายที่ระบบรองรับ (ตรงกับ Static Template ใน service)
const VALID_GOALS = ['lose_weight', 'build_muscle', 'general'];

/**
 * รับ goal จาก body (optional) — ถ้าไม่ส่งหรือไม่รู้จัก จะให้ service ตัดสิน (fallback)
 * ถ้าส่งมาแต่ไม่อยู่ในรายการที่รองรับ → โยน 400
 */
function parseGenerateInput(body) {
  const goal = body && body.goal ? String(body.goal).trim() : null;
  if (goal && !VALID_GOALS.includes(goal)) {
    const err = new Error(`goal ไม่ถูกต้อง (รองรับ: ${VALID_GOALS.join(', ')})`);
    err.status = 400;
    throw err;
  }
  return { goal };
}

module.exports = { parseGenerateInput, VALID_GOALS };
