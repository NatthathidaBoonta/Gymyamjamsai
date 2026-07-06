/**
 * src/modules/workout-plan/workout-plan.dto.js
 *
 * DTO (Data Transfer Object) สำหรับโมดูล Workout Plan
 * กำหนดรูปแบบข้อมูลขาเข้าและขาออก พร้อม Validation
 */

const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const validateNumericFields = (body, errors) => {
  const { sets, reps, weightKg } = body;
  if (sets !== undefined && sets !== null && (isNaN(Number(sets)) || Number(sets) <= 0)) {
    errors.push('sets must be a positive number');
  }
  if (reps !== undefined && reps !== null && (isNaN(Number(reps)) || Number(reps) <= 0)) {
    errors.push('reps must be a positive number');
  }
  if (weightKg !== undefined && weightKg !== null && isNaN(Number(weightKg))) {
    errors.push('weightKg must be a number');
  }
};

/**
 * Validate ข้อมูลเพิ่มท่าออกกำลังกายลงในตาราง
 * @param {Object} body
 * @returns {{ valid: boolean, errors: string[] }}
 */
const validateAddPlanExerciseDto = (body) => {
  const errors = [];
  const { exerciseId, dayOfWeek } = body;

  if (!exerciseId || typeof exerciseId !== 'string') {
    errors.push('exerciseId is required');
  }

  if (!dayOfWeek || !DAYS_OF_WEEK.includes(dayOfWeek)) {
    errors.push(`dayOfWeek must be one of: ${DAYS_OF_WEEK.join(', ')}`);
  }

  validateNumericFields(body, errors);

  return { valid: errors.length === 0, errors };
};

/**
 * Validate ข้อมูลแก้ไขท่าออกกำลังกายในตาราง
 * @param {Object} body
 * @returns {{ valid: boolean, errors: string[] }}
 */
const validateUpdatePlanExerciseDto = (body) => {
  const errors = [];
  const { dayOfWeek } = body;

  if (!dayOfWeek || !DAYS_OF_WEEK.includes(dayOfWeek)) {
    errors.push(`dayOfWeek must be one of: ${DAYS_OF_WEEK.join(', ')}`);
  }

  validateNumericFields(body, errors);

  return { valid: errors.length === 0, errors };
};

const planResponseDto = (plan) => ({ success: true, data: plan });

const planExerciseResponseDto = (detail) => ({ success: true, data: detail });

module.exports = {
  validateAddPlanExerciseDto,
  validateUpdatePlanExerciseDto,
  planResponseDto,
  planExerciseResponseDto,
  DAYS_OF_WEEK,
};
