/**
 * report.service.js — สร้างรายงาน CSV การเข้าร่วมกิจกรรม
 */

const repo = require('./report.repository');

// escape ค่าให้ปลอดภัยสำหรับ CSV (ครอบด้วย " เมื่อมี , " หรือขึ้นบรรทัดใหม่)
function csvEscape(value) {
  if (value === null || value === undefined) return '';
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/**
 * สร้างสตริง CSV ของการเข้าร่วมกิจกรรม
 * - trainer เห็นเฉพาะกิจกรรมของตนเอง / admin เห็นทั้งหมด
 */
async function activitiesCsv({ role, userId, month, year }) {
  const trainerId = role === 'trainer' ? userId : null;
  const rows = await repo.getAttendanceRows({ trainerId, month, year });

  const header = [
    'activity_title',
    'start_datetime',
    'member_email',
    'member_name',
    'registered_at',
    'attended',
  ];
  const lines = [header.join(',')];

  for (const r of rows) {
    lines.push(
      [
        csvEscape(r.activity_title),
        csvEscape(r.start_datetime),
        csvEscape(r.member_email),
        csvEscape(r.member_name),
        csvEscape(r.registered_at),
        r.is_attended ? 'yes' : 'no',
      ].join(','),
    );
  }

  // ปิดท้ายด้วย newline ตามมาตรฐาน CSV (RFC 4180)
  return { csv: `${lines.join('\n')}\n`, count: rows.length };
}

module.exports = { activitiesCsv };
