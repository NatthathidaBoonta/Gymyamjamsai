/**
 * src/modules/auth/auth.controller.js
 * 
 * Controller สำหรับโมดูล Auth
 * รับ HTTP Request, เรียกใช้ Service, ส่ง Response
 */

const { register, login } = require('./auth.service');
const { validateRegisterDto, validateLoginDto, authResponseDto } = require('./auth.dto');

/**
 * POST /api/auth/register
 * @desc  สมัครสมาชิกใหม่
 * @access Public
 */
const registerController = async (req, res, next) => {
  try {
    // Validate Input
    const { valid, errors } = validateRegisterDto(req.body);
    if (!valid) {
      return res.status(400).json({ success: false, errors });
    }

    const { email, password, name } = req.body;
    const { user, token } = await register({ email, password, name });

    const response = authResponseDto(user, token);
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 * @desc  เข้าสู่ระบบ
 * @access Public
 */
const loginController = async (req, res, next) => {
  try {
    // Validate Input
    const { valid, errors } = validateLoginDto(req.body);
    if (!valid) {
      return res.status(400).json({ success: false, errors });
    }

    const { email, password } = req.body;
    const { user, token } = await login({ email, password });

    const response = authResponseDto(user, token);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

module.exports = { registerController, loginController };
