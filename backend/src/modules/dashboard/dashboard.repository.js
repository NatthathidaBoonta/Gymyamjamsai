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
     WHERE user_id = ? AND status = 'approved'`,
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
    "SELECT COUNT(*) AS total, COALESCE(SUM(is_attended), 0) AS attended FROM activity_registrations WHERE status = 'approved'",
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

/** ข้อมูลกราฟสำหรับ admin: กิจกรรมยอดนิยม, ผู้ใช้ใหม่รายสัปดาห์, สัดส่วน role, การจองรายวัน */
async function getAdminCharts() {
  const [popular] = await pool.query(
    `SELECT a.id, a.title, a.max_participants, a.start_datetime, a.status,
            COUNT(r.id) AS registrations,
            TRIM(CONCAT(COALESCE(p.first_name, ''), ' ', COALESCE(p.last_name, ''))) AS trainer_name
     FROM activities a
     LEFT JOIN activity_registrations r ON r.activity_id = a.id AND r.status = 'approved'
     LEFT JOIN user_profiles p ON p.user_id = a.trainer_id
     GROUP BY a.id ORDER BY registrations DESC, a.start_datetime DESC LIMIT 5`,
  );
  const [newUsers] = await pool.query(
    `SELECT DATE_FORMAT(DATE_SUB(created_at, INTERVAL WEEKDAY(created_at) DAY), '%Y-%m-%d') AS week, COUNT(*) AS count
     FROM users WHERE deleted_at IS NULL AND created_at >= DATE_SUB(CURDATE(), INTERVAL 8 WEEK)
     GROUP BY week ORDER BY week`,
  );
  const [roles] = await pool.query(
    'SELECT role, COUNT(*) AS count FROM users WHERE deleted_at IS NULL GROUP BY role',
  );
  const [regsPerDay] = await pool.query(
    `SELECT DATE(created_at) AS date, COUNT(*) AS count
     FROM activity_registrations WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)
     GROUP BY DATE(created_at) ORDER BY date`,
  );
  const [exByCat] = await pool.query(
    'SELECT COALESCE(category, "other") AS category, COUNT(*) AS count FROM exercises GROUP BY category',
  );
  const [[pending]] = await pool.query("SELECT COUNT(*) AS c FROM exercise_suggestions WHERE status = 'pending'");
  const [[activeMembers]] = await pool.query(
    `SELECT COUNT(DISTINCT p.user_id) AS c
     FROM workout_logs wl JOIN workout_plan_details d ON d.id = wl.plan_detail_id JOIN workout_plans p ON p.id = d.plan_id
     WHERE wl.logged_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`,
  );
  return {
    popular_activities: popular.map((r) => ({ ...r, registrations: Number(r.registrations), trainer_name: r.trainer_name || null })),
    new_users_by_week: newUsers.map((r) => ({ week: r.week, count: Number(r.count) })),
    users_by_role: roles.map((r) => ({ role: r.role, count: Number(r.count) })),
    registrations_by_day: regsPerDay.map((r) => ({ date: r.date, count: Number(r.count) })),
    exercises_by_category: exByCat.map((r) => ({ category: r.category, count: Number(r.count) })),
    pending_suggestions: Number(pending.c),
    active_members_7d: Number(activeMembers.c),
  };
}

/** สรุปสำหรับ trainer: คอร์สของฉัน + ผู้สมัคร + ข้อเสนอท่า */
async function getTrainerSummary(trainerId) {
  const [[counts]] = await pool.query(
    `SELECT COUNT(*) AS total,
            SUM(status = 'open') AS open_count, SUM(status = 'full') AS full_count, SUM(status = 'closed') AS closed_count,
            SUM(start_datetime >= NOW() AND status <> 'closed') AS upcoming
     FROM activities WHERE trainer_id = ?`,
    [trainerId],
  );
  const [[regs]] = await pool.query(
    `SELECT COUNT(*) AS c FROM activity_registrations r JOIN activities a ON a.id = r.activity_id
     WHERE a.trainer_id = ? AND r.status = 'approved'`,
    [trainerId],
  );
  const [upcoming] = await pool.query(
    `SELECT a.id, a.title, a.start_datetime, a.max_participants, a.status,
            COUNT(r.id) AS registrations
     FROM activities a LEFT JOIN activity_registrations r ON r.activity_id = a.id AND r.status = 'approved'
     WHERE a.trainer_id = ? AND a.status <> 'closed' AND (a.start_datetime IS NULL OR a.start_datetime >= NOW())
     GROUP BY a.id ORDER BY a.start_datetime LIMIT 5`,
    [trainerId],
  );
  const [suggestions] = await pool.query(
    'SELECT status, COUNT(*) AS count FROM exercise_suggestions WHERE trainer_id = ? GROUP BY status',
    [trainerId],
  );
  const [[pendingReq]] = await pool.query(
    `SELECT COUNT(*) AS c FROM activity_registrations r JOIN activities a ON a.id = r.activity_id
     WHERE a.trainer_id = ? AND r.status = 'pending' AND a.status <> 'closed'`,
    [trainerId],
  );
  const sug = { pending: 0, approved: 0, rejected: 0 };
  for (const r of suggestions) sug[r.status] = Number(r.count);
  return {
    courses: {
      total: Number(counts.total), open: Number(counts.open_count || 0), full: Number(counts.full_count || 0),
      closed: Number(counts.closed_count || 0), upcoming: Number(counts.upcoming || 0),
    },
    total_registrations: Number(regs.c),
    pending_requests: Number(pendingReq.c),
    upcoming_courses: upcoming.map((r) => ({ ...r, registrations: Number(r.registrations) })),
    suggestions: sug,
  };
}

module.exports = { getWeightTrend, getWorkoutFrequency, getAttendanceRate, getAdminSummary, getAdminCharts, getTrainerSummary };
