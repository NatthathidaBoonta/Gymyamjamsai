/**
 * src/modules/auth/auth.dto.js
 * 
 * DTO (Data Transfer Object) สำหรับโมดูล Auth
 * กำหนดรูปแบบข้อมูลขาเข้าและขาออก พร้อม Validation
 */

/**
 * Validate ข้อมูล Register
 * @param {Object} body
 * @returns {{ valid: boolean, errors: string[] }}
 */
const validateRegisterDto = (body) => {
  const errors = [];
  const { email, password, name } = body;

  if (!email || typeof email !== 'string') {
    errors.push('email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('email format is invalid');
  }

  if (!password || typeof password !== 'string') {
    errors.push('password is required');
  } else if (password.length < 8) {
    errors.push('password must be at least 8 characters');
  }

  if (name && typeof name !== 'string') {
    errors.push('name must be a string');
  }

  return { valid: errors.length === 0, errors };
};

/**
 * Validate ข้อมูล Login
 * @param {Object} body
 * @returns {{ valid: boolean, errors: string[] }}
 */
const validateLoginDto = (body) => {
  const errors = [];
  const { email, password } = body;

  if (!email || typeof email !== 'string') {
    errors.push('email is required');
  }

  if (!password || typeof password !== 'string') {
    errors.push('password is required');
  }

  return { valid: errors.length === 0, errors };
};

/**
 * สร้าง Response object สำหรับ Auth (ไม่ส่ง password กลับ)
 * @param {Object} user
 * @param {string} token
 * @returns {Object}
 */
const authResponseDto = (user, token) => ({
  success: true,
  data: {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    },
  },
});

module.exports = { validateRegisterDto, validateLoginDto, authResponseDto };
