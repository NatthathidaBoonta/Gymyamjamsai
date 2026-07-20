/**
 * report.dto.js — Validation/parse ตัวกรองรายงาน
 */

function badRequest(message) {
  const err = new Error(message);
  err.status = 400;
  return err;
}

/**
 * แปลง query ?month=&year= (optional) — ถ้าส่งมาต้องอยู่ในช่วงที่ถูกต้อง
 */
function parseMonthYear(query) {
  let month = null;
  let year = null;

  if (query.month !== undefined && query.month !== '') {
    month = parseInt(query.month, 10);
    if (!Number.isInteger(month) || month < 1 || month > 12) {
      throw badRequest('month ต้องเป็นตัวเลข 1-12');
    }
  }
  if (query.year !== undefined && query.year !== '') {
    year = parseInt(query.year, 10);
    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
      throw badRequest('year ไม่ถูกต้อง');
    }
  }
  return { month, year };
}

module.exports = { parseMonthYear };
