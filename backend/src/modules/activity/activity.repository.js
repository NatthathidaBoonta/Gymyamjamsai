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
async function listAll(viewerId) {
  const [rows] = await pool.query(
    `SELECT a.id, a.trainer_id, a.title, a.description, a.max_participants, a.start_datetime, a.status,
            COALESCE(r.cnt, 0) AS current_participants,
            COALESCE(r.pending_cnt, 0) AS pending_count,
            (a.max_participants - COALESCE(r.cnt, 0)) AS available_seats,
            TRIM(CONCAT(COALESCE(tp.first_name, ''), ' ', COALESCE(tp.last_name, ''))) AS trainer_name,
            (SELECT mr.status FROM activity_registrations mr
             WHERE mr.activity_id = a.id AND mr.user_id = ? AND mr.status IN ('pending', 'approved')
             LIMIT 1
            ) AS registration_status
     FROM activities a
     LEFT JOIN user_profiles tp ON tp.user_id = a.trainer_id
     LEFT JOIN (
       SELECT activity_id, COUNT(*) AS cnt, SUM(status = 'pending') AS pending_cnt
       FROM activity_registrations WHERE status IN ('pending', 'approved')
       GROUP BY activity_id
     ) r ON r.activity_id = a.id
     ORDER BY a.start_datetime`,
    [viewerId || ''],
  );
  return rows.map((r) => ({
    ...r,
    pending_count: Number(r.pending_count || 0),
    is_registered: !!r.registration_status,
    registration_status: r.registration_status || null,
    trainer_name: r.trainer_name || null,
  }));
}

async function findById(id) {
  const [rows] = await pool.query(
    'SELECT id, trainer_id, title, description, max_participants, start_datetime, status FROM activities WHERE id = ? LIMIT 1',
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
 * แก้ไขกิจกรรม — ถ้าเพิ่มที่นั่งจน > จำนวนที่จองแล้ว ให้กลับเป็น open อัตโนมัติ (ยกเว้น closed)
 */
async function update(id, { title, description, maxParticipants, startDatetime }) {
  const [[{ cnt }]] = await pool.query(
    "SELECT COUNT(*) AS cnt FROM activity_registrations WHERE activity_id = ? AND status IN ('pending', 'approved')",
    [id],
  );
  const status = cnt >= maxParticipants ? 'full' : 'open';
  const [result] = await pool.query(
    `UPDATE activities
     SET title = ?, description = ?, max_participants = ?, start_datetime = ?,
         status = IF(status = 'closed', 'closed', ?)
     WHERE id = ?`,
    [title, description, maxParticipants, startDatetime, status, id],
  );
  return result.affectedRows;
}

/**
 * ยกเลิกกิจกรรม (soft: status = closed) และคืน user_id ผู้ลงทะเบียนเพื่อแจ้งเตือน
 */
async function close(id) {
  const [regs] = await pool.query(
    "SELECT user_id FROM activity_registrations WHERE activity_id = ? AND status IN ('pending', 'approved')",
    [id],
  );
  await pool.query("UPDATE activities SET status = 'closed' WHERE id = ?", [id]);
  return regs.map((r) => r.user_id);
}

/**
 * member ยกเลิกการจองของตัวเอง — ถ้าคลาสเคย full ให้เปิดรับใหม่
 * @returns {number} affectedRows (0 = ไม่ได้จองไว้)
 */
async function cancelRegistration(activityId, userId) {
  const [result] = await pool.query(
    "UPDATE activity_registrations SET status = 'cancelled' WHERE activity_id = ? AND user_id = ? AND status IN ('pending', 'approved')",
    [activityId, userId],
  );
  if (result.affectedRows > 0) {
    await pool.query("UPDATE activities SET status = 'open' WHERE id = ? AND status = 'full'", [activityId]);
  }
  return result.affectedRows;
}

/**
 * ลงทะเบียนเข้าร่วมกิจกรรมแบบกัน Race Condition
 */
async function register(activityId, userId) {
  const conn = await pool.getConnection();
  let committed = false;
  try {
    await conn.beginTransaction();

    const [actRows] = await conn.query(
      'SELECT id, max_participants, status, start_datetime FROM activities WHERE id = ? FOR UPDATE',
      [activityId],
    );
    if (!actRows.length) throw httpError('ไม่พบกิจกรรมที่ระบุ', 404);
    const activity = actRows[0];
    if (activity.status === 'closed') throw httpError('กิจกรรมนี้ปิดรับลงทะเบียนแล้ว', 409);

    const [[{ cnt }]] = await conn.query(
      "SELECT COUNT(*) AS cnt FROM activity_registrations WHERE activity_id = ? AND status IN ('pending', 'approved')",
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

    const [existing] = await conn.query(
      'SELECT id, status FROM activity_registrations WHERE activity_id = ? AND user_id = ? LIMIT 1',
      [activityId, userId],
    );
    if (existing.length && ['pending', 'approved'].includes(existing[0].status)) {
      throw httpError('คุณลงทะเบียนหรือรอการอนุมัติกิจกรรมนี้อยู่แล้ว', 409);
    }

    if (activity.start_datetime) {
      const [overlap] = await conn.query(
        `SELECT a.title
         FROM activity_registrations ar
         JOIN activities a ON a.id = ar.activity_id
         WHERE ar.user_id = ? AND ar.status IN ('pending', 'approved')
           AND a.status <> 'closed'
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
      registrationId = existing[0].id;
      await conn.query("UPDATE activity_registrations SET status = 'pending' WHERE id = ?", [
        registrationId,
      ]);
    } else {
      registrationId = crypto.randomUUID();
      await conn.query(
        "INSERT INTO activity_registrations (id, activity_id, user_id, status) VALUES (?, ?, ?, 'pending')",
        [registrationId, activityId, userId],
      );
    }

    let activityStatus = activity.status;
    if (cnt + 1 >= activity.max_participants) {
      await conn.query("UPDATE activities SET status = 'full' WHERE id = ?", [activityId]);
      activityStatus = 'full';
    }

    await conn.commit();
    committed = true;
    return { registration_id: registrationId, activity_status: activityStatus, status: 'pending' };
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
 * รายชื่อผู้ลงทะเบียน (สำหรับ Trainer เช็คชื่อ และอนุมัติ)
 */
async function getParticipants(activityId) {
  const [rows] = await pool.query(
    `SELECT r.user_id, u.email, r.is_attended, r.status, r.created_at,
            TRIM(CONCAT(COALESCE(p.first_name, ''), ' ', COALESCE(p.last_name, ''))) AS name
     FROM activity_registrations r
     JOIN users u ON u.id = r.user_id
     LEFT JOIN user_profiles p ON p.user_id = r.user_id
     WHERE r.activity_id = ? AND r.status IN ('pending', 'approved')
     ORDER BY r.created_at`,
    [activityId],
  );
  return rows.map((r) => ({
    user_id: r.user_id,
    name: r.name || null,
    email: r.email,
    attended: !!r.is_attended,
    status: r.status,
    registered_at: r.created_at,
  }));
}

/**
 * บันทึกการเช็คชื่อ (Attendance) ของผู้ลงทะเบียนคนหนึ่ง
 */
async function setAttendance(activityId, userId, attended) {
  const [result] = await pool.query(
    "UPDATE activity_registrations SET is_attended = ? WHERE activity_id = ? AND user_id = ? AND status = 'approved'",
    [attended ? 1 : 0, activityId, userId],
  );
  return result.affectedRows;
}

/**
 * อัปเดตสถานะการลงทะเบียน (Approve/Reject)
 */
/**
 * เทรนเนอร์อนุมัติ/ปฏิเสธผู้สมัคร
 * - approve ได้เฉพาะจาก pending · reject ได้จาก pending หรือ approved
 * - ปฏิเสธแล้วคืนที่นั่ง: ถ้าคลาสเคย full ให้กลับเป็น open
 * @returns {number} affectedRows (0 = ไม่พบ หรือสถานะต้นทางไม่ตรง)
 */
async function updateRegistrationStatus(activityId, userId, status) {
  const from = status === 'approved' ? ['pending'] : ['pending', 'approved'];
  const [result] = await pool.query(
    `UPDATE activity_registrations SET status = ?
     WHERE activity_id = ? AND user_id = ? AND status IN (${from.map(() => '?').join(', ')})`,
    [status, activityId, userId, ...from],
  );
  if (result.affectedRows > 0 && status === 'rejected') {
    await pool.query("UPDATE activities SET status = 'open' WHERE id = ? AND status = 'full'", [activityId]);
  }
  return result.affectedRows;
}

module.exports = {
  listAll,
  findById,
  create,
  update,
  close,
  register,
  cancelRegistration,
  getParticipants,
  setAttendance,
  updateRegistrationStatus
};
