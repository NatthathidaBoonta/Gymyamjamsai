const crypto = require('crypto');
const userRepository = require('./user.repository');

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

module.exports = {
  getUserProfile,
  updateUserProfile,
};
