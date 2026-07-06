/**
 * src/modules/profile/profile.dto.js
 *
 * DTO (Data Transfer Object) สำหรับโมดูล Profile
 * กำหนดรูปแบบข้อมูลขาเข้าและขาออก พร้อม Validation
 */

const FITNESS_LEVELS = ['beginner', 'intermediate', 'advanced'];
const GENDERS = ['male', 'female', 'other'];

/**
 * Validate ข้อมูล Profile (onboarding / edit)
 * @param {Object} body
 * @returns {{ valid: boolean, errors: string[] }}
 */
const validateProfileDto = (body) => {
  const errors = [];
  const { weightKg, heightCm, age, gender, goal, fitnessLevel } = body;

  if (weightKg === undefined || weightKg === null || isNaN(Number(weightKg)) || Number(weightKg) <= 0) {
    errors.push('weightKg must be a positive number');
  }

  if (heightCm === undefined || heightCm === null || isNaN(Number(heightCm)) || Number(heightCm) <= 0) {
    errors.push('heightCm must be a positive number');
  }

  if (age === undefined || age === null || isNaN(Number(age)) || Number(age) <= 0) {
    errors.push('age must be a positive number');
  }

  if (gender && !GENDERS.includes(gender)) {
    errors.push(`gender must be one of: ${GENDERS.join(', ')}`);
  }

  if (!goal || typeof goal !== 'string') {
    errors.push('goal is required');
  }

  if (!fitnessLevel || !FITNESS_LEVELS.includes(fitnessLevel)) {
    errors.push(`fitnessLevel must be one of: ${FITNESS_LEVELS.join(', ')}`);
  }

  return { valid: errors.length === 0, errors };
};

/**
 * สร้าง Response object สำหรับ Profile
 * @param {Object|null} profile
 * @returns {Object}
 */
const profileResponseDto = (profile) => ({
  success: true,
  data: profile
    ? {
        weightKg: profile.weightKg !== null ? Number(profile.weightKg) : null,
        heightCm: profile.heightCm !== null ? Number(profile.heightCm) : null,
        age: profile.age,
        gender: profile.gender,
        goal: profile.goal,
        fitnessLevel: profile.fitnessLevel,
        updatedAt: profile.updatedAt,
      }
    : null,
});

module.exports = { validateProfileDto, profileResponseDto, FITNESS_LEVELS, GENDERS };
