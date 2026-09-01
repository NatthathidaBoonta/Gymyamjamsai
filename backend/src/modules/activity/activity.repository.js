/**
 * activity.repository.js — Data access layer สำหรับกิจกรรม/คลาส และการลงทะเบียน
 */

const crypto = require('crypto');
const { pool } = require('../../database');

function httpError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

/**
 * รายการกิจกรรมทั้งหมด พร้อมจำนวนที่นั่งว่าง (available_seats)
 */
async function listAll() {
  const [rows] = await pool.query(
    `SELECT a.id, a.title, a.description, a.max_participants, a.start_datetime, a.status,
            (a.max_participants - COALESCE(r.cnt, 0)) AS available_seats
     FROM activities a
     LEFT JOIN (
       SELECT activity_id, COUNT(*) AS cnt
       FROM activity_registrations WHERE status = 'registered'
       GROUP BY activity_id
     ) r ON r.activity_id = a.id
     ORDER BY a.start_datetime`,
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query(
    'SELECT id, trainer_id, title, max_participants, status FROM activities WHERE id = ? LIMIT 1',
    [id],
  );
  return rows[0] || null;
}

async function create({ trainerId, title, description, maxParticipants, startDatetime }) {
  const id = crypto.randomUUID();
  await pool.query(
    `INSERT INTO activities (id, trainer_id, title, description, max_participants, start_datetime, status)
     VALUES (?, ?, ?, ?, ?, ?, 'open')`,
    [id, trainerId, title, description, maxParticipants, startDatetime],
  );
  return { id, status: 'open' };
}

/**
 * ลงทะเบียนเข้าร่วมกิจกรรมแบบกัน Race Condition
 *
 * ใช้ Transaction + `SELECT ... FOR UPDATE` ล็อกแถว activity เพื่อ serialize
 * ผู้จองพร้อมกัน (ตาม 11-plan): ผู้จองที่สองจะรอจนคนแรก commit แล้วค่อยนับที่นั่งใหม่
 * จึงกันการจองเกิน max_participants ได้จริง
 */
async function register(activityId, userId) {
  const conn = await pool.getConnection();
  let committed = false;
  try {
    await conn.beginTransaction();

    // ล็อกแถว activity (locking read — อ่านค่าล่าสุด และ defer snapshot ของ consistent read)
    const [actRows] = await conn.query(
      'SELECT id, max_participants, status, start_datetime FROM activities WHERE id = ? FOR UPDATE',
      [activityId],
    );
    if (!actRows.length) throw httpError('ไม่พบกิจกรรมที่ระบุ', 404);
    const activity = actRows[0];
    if (activity.status === 'closed') throw httpError('กิจกรรมนี้ปิดรับลงทะเบียนแล้ว', 409);

    // นับจำนวนที่ลงทะเบียนแล้ว (snapshot ถูกสร้างหลังได้ lock → เห็นข้อมูลล่าสุด)
    const [[{ cnt }]] = await conn.query(
      "SELECT COUNT(*) AS cnt FROM activity_registrations WHERE activity_id = ? AND status = 'registered'",
      [activityId],
    );

    if (cnt >= activity.max_participants) {
      if (activity.status !== 'full') {
        await conn.query("UPDATE activities SET status = 'full' WHERE id = ?", [activityId]);
      }
      await conn.commit();
      committed = true;
      throw httpError('กิจกรรมนี้เต็มแล้ว', 409);
    }

    // กันลงทะเบียนซ้ำ (มี UNIQUE(activity_id, user_id) ใน schema รองรับอีกชั้น)
    const [existing] = await conn.query(
      'SELECT id, status FROM activity_registrations WHERE activity_id = ? AND user_id = ? LIMIT 1',
      [activityId, userId],
    );
    if (existing.length && existing[0].status === 'registered') {
      throw httpError('คุณลงทะเบียนกิจกรรมนี้ไว้แล้ว', 409);
    }

    // ตรวจสอบการจองคลาสซ้อนทับ (ระยะเวลาคลาสสมมติที่ 2 ชั่วโมง / 120 นาที)
    if (activity.start_datetime) {
      const [overlap] = await conn.query(
        `SELECT a.title
         FROM activity_registrations ar
         JOIN activities a ON a.id = ar.activity_id
         WHERE ar.user_id = ? AND ar.status = 'registered'
           AND a.id != ?
           AND ABS(TIMESTAMPDIFF(MINUTE, a.start_datetime, ?)) < 120
         LIMIT 1`,
        [userId, activityId, activity.start_datetime]
      );
      if (overlap.length > 0) {
        throw httpError(`คุณมีการจองคลาสที่เวลาซ้อนทับกัน: ${overlap[0].title}`, 409);
      }
    }

    let registrationId;
    if (existing.length) {
      registrationId = existing[0].id; // เคยยกเลิกไว้ → เปิดใช้ใหม่
      await conn.query("UPDATE activity_registrations SET status = 'registered' WHERE id = ?", [
        registrationId,
      ]);
    } else {
      registrationId = crypto.randomUUID();
      await conn.query(
        "INSERT INTO activity_registrations (id, activity_id, user_id, status) VALUES (?, ?, ?, 'registered')",
        [registrationId, activityId, userId],
      );
    }

    // ถ้าที่นั่งเต็มพอดีหลังจองนี้ → ปรับสถานะเป็น full
    let activityStatus = activity.status;
    if (cnt + 1 >= activity.max_participants) {
      await conn.query("UPDATE activities SET status = 'full' WHERE id = ?", [activityId]);
      activityStatus = 'full';
    }

    await conn.commit();
    committed = true;
    return { registration_id: registrationId, activity_status: activityStatus };
  } catch (err) {
    if (!committed) {
      try {
        await conn.rollback();
      } catch {
        /* ignore rollback error */
      }
    }
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * รายชื่อผู้ลงทะเบียน (สำหรับ Trainer เช็คชื่อ) — ชื่อดึงจาก user_profiles
 */
async function getParticipants(activityId) {
  const [rows] = await pool.query(
    `SELECT r.user_id, u.email, r.is_attended, r.created_at,
            TRIM(CONCAT(COALESCE(p.first_name, ''), ' ', COALESCE(p.last_name, ''))) AS name
     FROM activity_registrations r
     JOIN users u ON u.id = r.user_id
     LEFT JOIN user_profiles p ON p.user_id = r.user_id
     WHERE r.activity_id = ? AND r.status = 'registered'
     ORDER BY r.created_at`,
    [activityId],
  );
  return rows.map((r) => ({
    user_id: r.user_id,
    name: r.name || null,
    email: r.email,
    attended: !!r.is_attended,
    registered_at: r.created_at,
  }));
}

/**
 * บันทึกการเช็คชื่อ (Attendance) ของผู้ลงทะเบียนคนหนึ่ง
 * @returns {number} affectedRows (0 = ไม่พบผู้ลงทะเบียน)
 */
async function setAttendance(activityId, userId, attended) {
  const [result] = await pool.query(
    "UPDATE activity_registrations SET is_attended = ? WHERE activity_id = ? AND user_id = ? AND status = 'registered'",
    [attended ? 1 : 0, activityId, userId],
  );
  return result.affectedRows;
}

module.exports = { listAll, findById, create, register, getParticipants, setAttendance };
