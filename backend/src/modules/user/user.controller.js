const userService = require('./user.service');

async function getProfile(req, res, next) {
  try {
    const userId = req.user.id; // มาจาก authenticate middleware
    const profile = await userService.getUserProfile(userId);
    res.status(200).json({
      status: 'success',
      data: profile,
    });
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const result = await userService.updateUserProfile(userId, req.body);
    res.status(200).json({
      status: 'success',
      message: 'อัปเดตโปรไฟล์สำเร็จ',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProfile,
  updateProfile,
};
