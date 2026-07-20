/**
 * activity.dto.js — Validation สำหรับ Activity module
 */

function badRequest(message) {
  const err = new Error(message);
  err.status = 400;
  return err;
}

// แปลงเป็นรูปแบบ DATETIME ของ MySQL ('YYYY-MM-DD HH:MM:SS', UTC)
function toMysqlDatetime(input) {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

/**
 * validate ตอน trainer สร้างกิจกรรม
 * รองรับชื่อฟิลด์ตาม contract (datetime, max_seats) และชื่อ column ตรง (start_datetime, max_participants)
 */
function validateCreate(body) {
  const title = body && body.title ? String(body.title).trim() : '';
  if (!title) throw badRequest('title จำเป็นต้องระบุ');

  const maxRaw = body ? (body.max_seats ?? body.max_participants) : undefined;
  const maxParticipants = parseInt(maxRaw, 10);
  if (!Number.isInteger(maxParticipants) || maxParticipants < 1) {
    throw badRequest('max_seats ต้องเป็นจำนวนเต็มบวก');
  }

  const description = body && body.description ? String(body.description) : null;

  let startDatetime = null;
  const rawDt = body ? (body.datetime ?? body.start_datetime) : undefined;
  if (rawDt) {
    startDatetime = toMysqlDatetime(rawDt);
    if (startDatetime === undefined) throw badRequest('datetime ไม่ถูกต้อง');
  }

  return { title, description, maxParticipants, startDatetime };
}

/**
 * validate ตอน trainer เช็คชื่อ
 */
function validateAttendance(body) {
  const userId = body && body.user_id ? String(body.user_id) : '';
  if (!userId) throw badRequest('user_id จำเป็นต้องระบุ');
  if (typeof (body && body.attended) !== 'boolean') {
    throw badRequest('attended ต้องเป็น true หรือ false');
  }
  return { userId, attended: body.attended };
}

module.exports = { validateCreate, validateAttendance };
