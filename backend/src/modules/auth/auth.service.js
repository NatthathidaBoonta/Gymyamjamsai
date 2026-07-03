/**
 * src/modules/auth/auth.service.js
 * 
 * Service สำหรับโมดูล Auth
 * จัดการ Business Logic: hash password, UUID, JWT
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { createUser, findUserByEmail } = require('./auth.repository');

const SALT_ROUNDS = 12;

/**
 * สร้างบัญชีผู้ใช้ใหม่
 * @param {{ email: string, password: string, name?: string }} dto
 * @returns {Promise<{ user: Object, token: string }>}
 */
const register = async ({ email, password, name }) => {
  // ตรวจสอบว่า email ถูกใช้งานแล้วหรือยัง
  const existing = await findUserByEmail(email);
  if (existing) {
    const error = new Error('Email already in use');
    error.statusCode = 409;
    throw error;
  }

  // Hash password ด้วย bcrypt
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // สร้าง UUID
  const id = uuidv4();

  // สร้าง User ใน Database
  const user = await createUser({ id, email, password: hashedPassword, name });

  // สร้าง JWT Token
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

  return { user, token };
};

/**
 * เข้าสู่ระบบ
 * @param {{ email: string, password: string }} dto
 * @returns {Promise<{ user: Object, token: string }>}
 */
const login = async ({ email, password }) => {
  // ค้นหา User ด้วย Email
  const user = await findUserByEmail(email);
  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // ตรวจสอบ Password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // สร้าง JWT Token
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

  return { user, token };
};

module.exports = { register, login };
