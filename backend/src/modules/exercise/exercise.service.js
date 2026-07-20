/**
 * exercise.service.js — Business logic สำหรับ Exercise module
 */

const repo = require('./exercise.repository');

function notFound(message) {
  const err = new Error(message);
  err.status = 404;
  return err;
}

async function list({ limit, offset, page }) {
  const { items, total } = await repo.findAll({ limit, offset });
  return { items, total, page, limit };
}

async function getById(id) {
  const exercise = await repo.findById(id);
  if (!exercise) throw notFound('ไม่พบท่าออกกำลังกายที่ระบุ');
  return exercise;
}

async function create(data) {
  return repo.create(data);
}

async function update(id, fields) {
  const affected = await repo.update(id, fields);
  if (affected === 0) throw notFound('ไม่พบท่าออกกำลังกายที่ระบุ');
  return repo.findById(id);
}

async function remove(id) {
  const affected = await repo.remove(id);
  if (affected === 0) throw notFound('ไม่พบท่าออกกำลังกายที่ระบุ');
}

module.exports = { list, getById, create, update, remove };
