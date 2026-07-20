/**
 * report.repository.js — Query ข้อมูลสำหรับรายงานการเข้าร่วมกิจกรรม
 */

const { pool } = require('../../database');

/**
 * ดึงข้อมูลการลงทะเบียน/เข้าร่วม เพื่อออกรายงาน
 * - trainerId != null → จำกัดเฉพาะกิจกรรมของ trainer คนนั้น (admin = null = ทั้งหมด)
 * - month/year → กรองตาม start_datetime ของกิจกรรม (ถ้าระบุ)
 */
async function getAttendanceRows({ trainerId, month, year }) {
  const where = ["r.status = 'registered'"];
  const params = [];

  if (trainerId) {
    where.push('a.trainer_id = ?');
    params.push(trainerId);
  }
  if (year) {
    where.push('YEAR(a.start_datetime) = ?');
    params.push(year);
  }
  if (month) {
    where.push('MONTH(a.start_datetime) = ?');
    params.push(month);
  }

  const [rows] = await pool.query(
    `SELECT a.title AS activity_title, a.start_datetime, u.email AS member_email,
            TRIM(CONCAT(COALESCE(p.first_name, ''), ' ', COALESCE(p.last_name, ''))) AS member_name,
            r.created_at AS registered_at, r.is_attended
     FROM activity_registrations r
     JOIN activities a ON a.id = r.activity_id
     JOIN users u ON u.id = r.user_id
     LEFT JOIN user_profiles p ON p.user_id = r.user_id
     WHERE ${where.join(' AND ')}
     ORDER BY a.start_datetime, a.title, u.email`,
    params,
  );
  return rows;
}

module.exports = { getAttendanceRows };
