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

async function getAllUsers(req, res, next) {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json({
      status: 'success',
      data: users,
    });
  } catch (err) {
    next(err);
  }
}

async function createUser(req, res, next) {
  try {
    const newUser = await userService.createUser(req.body);
    res.status(201).json({
      status: 'success',
      message: 'สร้างผู้ใช้งานสำเร็จ',
      data: newUser,
    });
  } catch (err) {
    next(err);
  }
}

async function updateUser(req, res, next) {
  try {
    const userId = req.params.id;
    const result = await userService.updateUser(req.user.id, userId, req.body);
    res.status(200).json({
      status: 'success',
      message: 'อัปเดตข้อมูลผู้ใช้งานสำเร็จ',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProfile,
  updateProfile,
  getAllUsers,
  createUser,
  updateUser,
};
