const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const userRepository = require('./user.repository');
const authRepo = require('../auth/auth.repository');
const { validateRegister } = require('../auth/auth.dto');

const SALT_ROUNDS = 12;
const VALID_ROLES = ['admin', 'trainer', 'member'];

function httpError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

async function getUserProfile(userId) {
  const profile = await userRepository.getProfileByUserId(userId);
  // ถ้ายังไม่เคยมี profile ใน db เลย หรือ user ไม่มี อาจจะได้ null
  // แต่เราคืนเป็น object เปล่าพร้อม email เผื่อยังไม่ได้ตั้งโปรไฟล์
  if (!profile) {
    return { email: '', first_name: '', last_name: '', fitness_goal: '', medical_conditions: '', weight_kg: null, height_cm: null, bmi: null };
  }
  return profile;
}

async function updateUserProfile(userId, data) {
  const { firstName, lastName, fitnessGoal, medicalConditions, weight, height } = data;
  
  const existingProfile = await getUserProfile(userId);

  await userRepository.upsertProfile(userId, {
    firstName: firstName !== undefined ? firstName : (existingProfile.first_name || null),
    lastName: lastName !== undefined ? lastName : (existingProfile.last_name || null),
    fitnessGoal: fitnessGoal !== undefined ? fitnessGoal : (existingProfile.fitness_goal || null),
    medicalConditions: medicalConditions !== undefined ? medicalConditions : (existingProfile.medical_conditions || null),
  });

  if (weight || height) {
    let bmi = null;
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (!isNaN(w) && !isNaN(h) && h > 0) {
      const h_meter = h / 100;
      bmi = w / (h_meter * h_meter);
    }
    
    const metricId = crypto.randomUUID();
    await userRepository.insertMetric({
      id: metricId,
      userId,
      weightKg: isNaN(w) ? null : w,
      heightCm: isNaN(h) ? null : h,
      bmi: bmi !== null ? parseFloat(bmi.toFixed(2)) : null,
    });
  }

  return { success: true };
}

async function getAllUsers() {
  return await userRepository.getAllUsers();
}

/**
 * ตรวจ role ที่ admin ส่งมา — ต้องเป็นค่าที่ระบบรู้จักเท่านั้น
 */
function validateRole(role) {
  if (!VALID_ROLES.includes(role)) {
    throw httpError(`บทบาทต้องเป็นหนึ่งใน: ${VALID_ROLES.join(', ')}`, 400);
  }
  return role;
}

/**
 * Admin สร้างผู้ใช้ใหม่ — ใช้กฎ email/password เดียวกับหน้า register
 */
async function createUser(data) {
  const { email, password } = validateRegister(data);
  const role = validateRole(data && data.role);

  if (await authRepo.existsByEmail(email)) {
    throw httpError('อีเมลนี้ถูกใช้งานแล้ว', 409);
  }
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const newUser = await authRepo.createUser({
    id: crypto.randomUUID(),
    email,
    passwordHash,
    role,
  });
  return newUser;
}

/**
 * Admin แก้ role / สถานะบัญชี — ห้ามแก้บัญชีตัวเอง (กันล็อคตัวเองออกจากระบบ)
 */
async function updateUser(actorId, id, data) {
  if (actorId === id) {
    throw httpError('ไม่สามารถแก้ไขบทบาทหรือสถานะบัญชีของตัวเองได้', 400);
  }
  const role = validateRole(data && data.role);
  if (data.is_active === undefined || data.is_active === null) {
    throw httpError('ข้อมูลไม่ครบถ้วน', 400);
  }
  const isActive = data.is_active === true || data.is_active === 1 || data.is_active === '1' ? 1 : 0;

  const affected = await userRepository.updateUser(id, { role, is_active: isActive });
  if (affected === 0) {
    throw httpError('ไม่พบผู้ใช้งาน', 404);
  }
  return { success: true };
}

module.exports = {
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  createUser,
  updateUser,
};
