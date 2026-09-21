/**
 * socket.js — Socket.IO สำหรับแชทกลุ่มของคอร์ส
 *
 * - ตรวจ JWT ตอน handshake (auth.token) แล้วผูก user กับ socket
 * - join_room  { activityId }            → ตรวจสิทธิ์ผ่าน chat.service ก่อนเข้าห้อง
 * - send_message { activityId, message } → ตรวจสิทธิ์ + validate + บันทึก แล้ว broadcast ให้ห้อง
 * - throttle ต่อ socket: 20 ข้อความ / 10 วินาที (REST มี rate limit อยู่แล้ว แต่ socket ไม่ผ่าน express)
 * - CORS ใช้กติกาเดียวกับ REST (FRONTEND_ORIGIN + localhost ทุกพอร์ต)
 */

const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const chatService = require('./modules/chat/chat.service');
const { isOriginAllowed } = require('./cors');

const THROTTLE_WINDOW_MS = 10_000;
const THROTTLE_MAX = 20;

function roomOf(activityId) {
  return `activity_${activityId}`;
}

function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      // socket.io ไม่มี req ให้เทียบ same-origin — ใช้ FRONTEND_ORIGIN / RENDER_EXTERNAL_URL / localhost
      origin: (origin, cb) => (isOriginAllowed(origin) ? cb(null, true) : cb(new Error('Not allowed by CORS'))),
      methods: ['GET', 'POST'],
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth && socket.handshake.auth.token;
    if (!token) return next(new Error('ต้องเข้าสู่ระบบก่อน'));
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = { id: payload.sub, role: payload.role };
      socket.sentAt = [];
      return next();
    } catch {
      return next(new Error('token ไม่ถูกต้องหรือหมดอายุ'));
    }
  });

  io.on('connection', (socket) => {
    const reply = (cb, payload) => typeof cb === 'function' && cb(payload);

    socket.on('join_room', async (data, cb) => {
      const activityId = data && String(data.activityId || '');
      try {
        const activity = await chatService.assertAccess(activityId, socket.user);
        socket.join(roomOf(activityId));
        reply(cb, { success: true, can_send: activity.status !== 'closed' });
      } catch (err) {
        reply(cb, { success: false, error: err.message });
      }
    });

    socket.on('leave_room', (data) => {
      if (data && data.activityId) socket.leave(roomOf(String(data.activityId)));
    });

    socket.on('send_message', async (data, cb) => {
      const activityId = data && String(data.activityId || '');
      const now = Date.now();
      socket.sentAt = socket.sentAt.filter((t) => now - t < THROTTLE_WINDOW_MS);
      if (socket.sentAt.length >= THROTTLE_MAX) {
        return reply(cb, { success: false, error: 'ส่งข้อความถี่เกินไป กรุณารอสักครู่' });
      }
      try {
        const saved = await chatService.sendMessage(activityId, socket.user, data && data.message);
        socket.sentAt.push(now);
        io.to(roomOf(activityId)).emit('receive_message', saved);
        return reply(cb, { success: true, data: saved });
      } catch (err) {
        return reply(cb, { success: false, error: err.message });
      }
    });
  });

  return io;
}

module.exports = initializeSocket;
