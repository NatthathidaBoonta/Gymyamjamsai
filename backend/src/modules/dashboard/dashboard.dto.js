/**
 * dashboard.dto.js — Validation/parse ช่วงเวลาสำหรับ Dashboard
 */

const DAY_MS = 24 * 60 * 60 * 1000;

function badRequest(message) {
  const err = new Error(message);
  err.status = 400;
  return err;
}

/**
 * แปลง query ?start_date=&end_date= (YYYY-MM-DD) เป็นช่วง datetime แบบเต็มวัน
 * ค่าเริ่มต้น: 30 วันย้อนหลังถึงวันนี้
 */
function parseDateRange(query) {
  const now = new Date();
  const end = query.end_date ? new Date(query.end_date) : now;
  const start = query.start_date
    ? new Date(query.start_date)
    : new Date(now.getTime() - 30 * DAY_MS);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw badRequest('start_date/end_date ไม่ถูกต้อง (รูปแบบ YYYY-MM-DD)');
  }
  if (start > end) throw badRequest('start_date ต้องไม่เกิน end_date');

  return {
    start: `${start.toISOString().slice(0, 10)} 00:00:00`,
    end: `${end.toISOString().slice(0, 10)} 23:59:59`,
  };
}

module.exports = { parseDateRange };
