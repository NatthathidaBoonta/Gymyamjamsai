/**
 * src/modules/profile/profile.controller.js
 *
 * Controller สำหรับโมดูล Profile
 * รับ HTTP Request, เรียกใช้ Service, ส่ง Response
 */

const { getProfile, saveProfile } = require('./profile.service');
const { validateProfileDto, profileResponseDto } = require('./profile.dto');

/**
 * GET /api/profile/me
 * @desc  ดึง Profile ของ User ปัจจุบัน (null ถ้ายังไม่เคยกรอก)
 * @access Private
 */
const getMyProfileController = async (req, res, next) => {
  try {
    const profile = await getProfile(req.user.id);
    res.status(200).json(profileResponseDto(profile));
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/profile/me
 * @desc  บันทึก (สร้าง/แก้ไข) Profile ของ User ปัจจุบัน
 * @access Private
 */
const saveMyProfileController = async (req, res, next) => {
  try {
    const { valid, errors } = validateProfileDto(req.body);
    if (!valid) {
      return res.status(400).json({ success: false, errors });
    }

    const profile = await saveProfile(req.user.id, req.body);
    res.status(200).json(profileResponseDto(profile));
  } catch (error) {
    next(error);
  }
};

module.exports = { getMyProfileController, saveMyProfileController };
