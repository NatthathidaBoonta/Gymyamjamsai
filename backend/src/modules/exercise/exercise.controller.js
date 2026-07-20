/**
 * exercise.controller.js — รับ req/res, เรียก service, ตอบตาม standard envelope
 */

const dto = require('./exercise.dto');
const service = require('./exercise.service');

async function list(req, res, next) {
  try {
    const { limit, offset, page } = dto.parsePagination(req.query);
    const data = await service.list({ limit, offset, page });
    res.status(200).json({ status: 'success', message: 'รายการท่าออกกำลังกาย', data });
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const data = await service.getById(req.params.id);
    res.status(200).json({ status: 'success', message: 'รายละเอียดท่าออกกำลังกาย', data });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const payload = dto.validateCreate(req.body);
    const data = await service.create(payload);
    res.status(201).json({ status: 'success', message: 'เพิ่มท่าออกกำลังกายสำเร็จ', data });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const fields = dto.validateUpdate(req.body);
    const data = await service.update(req.params.id, fields);
    res.status(200).json({ status: 'success', message: 'แก้ไขท่าออกกำลังกายสำเร็จ', data });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await service.remove(req.params.id);
    res.status(200).json({ status: 'success', message: 'ลบท่าออกกำลังกายสำเร็จ', data: null });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getOne, create, update, remove };
