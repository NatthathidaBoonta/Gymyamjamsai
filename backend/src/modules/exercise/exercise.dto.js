/**
 * exercise.dto.js — Validation + input shaping สำหรับ Exercise module
 */

function badRequest(message) {
  const err = new Error(message);
  err.status = 400;
  return err;
}

// ฟิลด์ที่อนุญาตให้เขียนได้ (whitelist — กัน column injection ใน UPDATE)
const WRITABLE = ['name', 'category', 'media_url', 'instructions'];

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
  return {
    name: fields.name.trim(),
    category: fields.category ?? null,
    media_url: fields.media_url ?? null,
    instructions: fields.instructions ?? null,
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
  return { page, limit, offset: (page - 1) * limit };
}

module.exports = { validateCreate, validateUpdate, parsePagination };
