/**
 * dashboard.service.js — Business logic สำหรับ Dashboard
 */

const repo = require('./dashboard.repository');

/**
 * สถิติส่วนตัวของ member (weight trend, workout frequency, attendance rate)
 * รัน query แบบขนานเพื่อลด latency
 */
async function personal(userId, { start, end }) {
  const [weightTrend, workoutFreq, attendance] = await Promise.all([
    repo.getWeightTrend(userId, start, end),
    repo.getWorkoutFrequency(userId, start, end),
    repo.getAttendanceRate(userId),
  ]);
  return {
    range: { start, end },
    weight_trend: weightTrend,
    workout_frequency: workoutFreq,
    attendance_rate: attendance,
  };
}

async function admin() {
  return repo.getAdminSummary();
}

module.exports = { personal, admin };
