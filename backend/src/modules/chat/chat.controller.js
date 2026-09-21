/**
 * chat.controller.js — REST ของแชทกลุ่มคอร์ส (ประวัติข้อความ + ข้อมูลห้อง)
 * การส่งแบบเรียลไทม์อยู่ที่ src/socket.js — REST POST มีไว้เป็น fallback เมื่อ socket ต่อไม่ได้
 */

const service = require('./chat.service');

async function room(req, res, next) {
  try {
    const data = await service.getRoom(req.params.activityId, req.user);
    res.status(200).json({ status: 'success', message: 'ข้อมูลห้องแชท', data });
  } catch (err) {
    next(err);
  }
}

async function messages(req, res, next) {
  try {
    const data = await service.getMessages(req.params.activityId, req.user, req.query);
    res.status(200).json({ status: 'success', message: 'ข้อความในห้องแชท', data });
  } catch (err) {
    next(err);
  }
}

async function send(req, res, next) {
  try {
    const data = await service.sendMessage(req.params.activityId, req.user, req.body && req.body.message);
    const io = req.app.locals.io;
    if (io) io.to(`activity_${req.params.activityId}`).emit('receive_message', data);
    res.status(201).json({ status: 'success', message: 'ส่งข้อความแล้ว', data });
  } catch (err) {
    next(err);
  }
}

module.exports = { room, messages, send };
