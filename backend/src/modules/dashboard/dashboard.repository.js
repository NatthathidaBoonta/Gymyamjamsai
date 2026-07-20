/**
 * dashboard.repository.js — Aggregate queries สำหรับ Dashboard
 * ทุก query อ้าง index ที่มีใน schema (user_metrics(user_id,recorded_at) ฯลฯ)
 */

const { pool } = require('../../database');

/**
 * แนวโน้มน้ำหนัก (time-series) ของ member ในช่วงเวลาที่กำหนด
 */
async function getWeightTrend(userId, start, end) {
  const [rows] = await pool.query(
    `SELECT recorded_at, weight_kg, bmi
     FROM user_metrics
     WHERE user_id = ? AND recorded_at BETWEEN ? AND ?
     ORDER BY recorded_at`,
    [userId, start, end],
  );
  return rows;
}

/**
 * ความถี่การออกกำลังกายรายวัน (นับจาก workout_logs ผ่าน plan ของ member)
 */
async function getWorkoutFrequency(userId, start, end) {
  const [rows] = await pool.query(
    `SELECT DATE(wl.logged_at) AS date, COUNT(*) AS count
     FROM workout_logs wl
     JOIN workout_plan_details d ON d.id = wl.plan_detail_id
     JOIN workout_plans p ON p.id = d.plan_id
     WHERE p.user_id = ? AND wl.logged_at BETWEEN ? AND ?
     GROUP BY DATE(wl.logged_at)
     ORDER BY date`,
    [userId, start, end],
  );
  return rows.map((r) => ({ date: r.date, count: Number(r.count) }));
}

/**
 * อัตราการเข้าคลาสของ member = (เช็คชื่อว่ามา / ลงทะเบียนทั้งหมด) * 100
 */
async function getAttendanceRate(userId) {
  const [[row]] = await pool.query(
    `SELECT COUNT(*) AS total, COALESCE(SUM(is_attended), 0) AS attended
     FROM activity_registrations
     WHERE user_id = ? AND status = 'registered'`,
    [userId],
  );
  const total = Number(row.total);
  const attended = Number(row.attended);
  return total ? Math.round((attended / total) * 10000) / 100 : 0;
}

/**
 * สรุปภาพรวมระบบสำหรับ Admin
 */
async function getAdminSummary() {
  const [[users]] = await pool.query('SELECT COUNT(*) AS c FROM users WHERE deleted_at IS NULL');
  const [[activities]] = await pool.query('SELECT COUNT(*) AS c FROM activities');
  const [[exercises]] = await pool.query('SELECT COUNT(*) AS c FROM exercises');
  const [[regs]] = await pool.query(
    "SELECT COUNT(*) AS total, COALESCE(SUM(is_attended), 0) AS attended FROM activity_registrations WHERE status = 'registered'",
  );
  const total = Number(regs.total);
  const attended = Number(regs.attended);
  return {
    total_users: Number(users.c),
    total_activities: Number(activities.c),
    total_exercises: Number(exercises.c),
    total_registrations: total,
    average_attendance_rate: total ? Math.round((attended / total) * 10000) / 100 : 0,
  };
}

module.exports = { getWeightTrend, getWorkoutFrequency, getAttendanceRate, getAdminSummary };
