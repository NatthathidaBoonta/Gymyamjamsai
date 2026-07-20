/**
 * auth.dto.js — Input validation สำหรับ Auth
 * โยน Error พร้อม status 400 เมื่อ input ไม่ถูกต้อง (central error handler จะจัดรูปแบบ response)
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function badRequest(message) {
  const err = new Error(message);
  err.status = 400;
  return err;
}

function extract(body) {
  const email = (body && body.email ? String(body.email) : '').trim();
  const password = body && body.password ? String(body.password) : '';
  return { email, password };
}

/**
 * ตรวจสอบ input ตอน register — บังคับ email ถูกรูปแบบ + password นโยบายความยาว
 * @returns {{ email: string, password: string }}
 */
function validateRegister(body) {
  const { email, password } = extract(body);
  if (!email || !password) throw badRequest('email และ password จำเป็นต้องระบุ');
  if (!EMAIL_RE.test(email)) throw badRequest('รูปแบบ email ไม่ถูกต้อง');
  if (password.length < 6) throw badRequest('password ต้องมีอย่างน้อย 6 ตัวอักษร');
  return { email, password };
}

/**
 * ตรวจสอบ input ตอน login — เช็คแค่ว่ามีค่าครบ
 * ไม่บังคับ password policy เพื่อให้ credential ที่ผิดตกไปที่ 401 (ไม่ใช่ 400)
 * @returns {{ email: string, password: string }}
 */
function validateLogin(body) {
  const { email, password } = extract(body);
  if (!email || !password) throw badRequest('email และ password จำเป็นต้องระบุ');
  return { email, password };
}

module.exports = { validateRegister, validateLogin };
