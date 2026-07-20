/**
 * auth.service.js — Business logic สำหรับ Auth
 * จัดการ hash รหัสผ่าน (bcrypt), สร้าง/ตรวจสอบ JWT และตรรกะ register/login
 */

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const repo = require('./auth.repository');

const SALT_ROUNDS = 12; // ตรงกับ security spec ใน architecture.md

function httpError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

/**
 * สร้าง JWT จากข้อมูลผู้ใช้ (secret มาจาก env เสมอ — กันรั่วไหลตามความเสี่ยง Phase 4)
 */
function signToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured');
  return jwt.sign({ sub: user.id, role: user.role }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });
}

/**
 * สมัครสมาชิกใหม่ — Guest ที่สมัครจะได้ role 'member' เสมอ
 * @returns {{ token: string, user_id: string }}
 */
async function register({ email, password }) {
  if (await repo.existsByEmail(email)) {
    throw httpError('อีเมลนี้ถูกใช้งานแล้ว', 409);
  }
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await repo.createUser({
    id: crypto.randomUUID(),
    email,
    passwordHash,
    role: 'member',
  });
  return { token: signToken(user), user_id: user.id };
}

/**
 * เข้าสู่ระบบ — ตรวจ email + password แล้วออก token
 * ใช้ข้อความ error กลางๆ กันการเดา (ไม่บอกว่า email หรือ password ผิด)
 * @returns {{ token: string, role: string }}
 */
async function login({ email, password }) {
  const user = await repo.findByEmail(email);
  if (!user) throw httpError('อีเมลหรือรหัสผ่านไม่ถูกต้อง', 401);
  if (!user.is_active) throw httpError('บัญชีนี้ถูกระงับการใช้งาน', 403);

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) throw httpError('อีเมลหรือรหัสผ่านไม่ถูกต้อง', 401);

  return { token: signToken(user), role: user.role };
}

module.exports = { register, login };
