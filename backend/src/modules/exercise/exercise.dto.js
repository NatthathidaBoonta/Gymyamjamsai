/**
 * exercise.dto.js — Validation + input shaping สำหรับ Exercise module
 */

function badRequest(message) {
  const err = new Error(message);
  err.status = 400;
  return err;
}

// ฟิลด์ที่อนุญาตให้เขียนได้ (whitelist — กัน column injection ใน UPDATE)
const WRITABLE = ['name', 'category', 'muscle_group', 'equipment', 'difficulty', 'media_url', 'instructions', 'tips'];
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];

function pickWritable(body) {
  const out = {};
  for (const key of WRITABLE) {
    if (body && body[key] !== undefined) {
      out[key] = body[key] === null ? null : String(body[key]);
    }
  }
  return out;
}

/**
 * validate ตอนสร้าง — name จำเป็น
 */
function validateCreate(body) {
  const fields = pickWritable(body);
  if (!fields.name || !fields.name.trim()) throw badRequest('name จำเป็นต้องระบุ');
  if (fields.difficulty !== undefined && !DIFFICULTIES.includes(fields.difficulty)) {
    throw badRequest(`difficulty ต้องเป็นหนึ่งใน: ${DIFFICULTIES.join(', ')}`);
  }
  return {
    name: fields.name.trim(),
    category: fields.category ?? null,
    muscle_group: fields.muscle_group ?? null,
    equipment: fields.equipment ?? null,
    difficulty: fields.difficulty ?? 'beginner',
    media_url: fields.media_url ?? null,
    instructions: fields.instructions ?? null,
    tips: fields.tips ?? null,
  };
}

/**
 * validate ตอนแก้ไข — ต้องมีอย่างน้อย 1 ฟิลด์
 */
function validateUpdate(body) {
  const fields = pickWritable(body);
  if (Object.keys(fields).length === 0)
    throw badRequest('ต้องระบุอย่างน้อย 1 ฟิลด์ที่ต้องการแก้ไข');
  if (fields.name !== undefined && (!fields.name || !fields.name.trim())) {
    throw badRequest('name ต้องไม่เป็นค่าว่าง');
  }
  if (fields.difficulty !== undefined && !DIFFICULTIES.includes(fields.difficulty)) {
    throw badRequest(`difficulty ต้องเป็นหนึ่งใน: ${DIFFICULTIES.join(', ')}`);
  }
  return fields;
}

/**
 * แปลง query ?page=&limit= เป็น { limit, offset } (integer ที่ปลอดภัย)
 */
function parsePagination(query) {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);
  if (!Number.isInteger(page) || page < 1) page = 1;
  if (!Number.isInteger(limit) || limit < 1) limit = 20;
  if (limit > 100) limit = 100; // กันดึงทีละมากเกินไป
  const q = query.q ? String(query.q).trim().slice(0, 100) : '';
  const category = query.category ? String(query.category).trim().slice(0, 50) : '';
  const difficulty = DIFFICULTIES.includes(query.difficulty) ? query.difficulty : '';
  return { page, limit, offset: (page - 1) * limit, q, category, difficulty };
}

module.exports = { validateCreate, validateUpdate, parsePagination };
