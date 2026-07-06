/**
 * src/modules/exercise/exercise.dto.js
 *
 * DTO (Data Transfer Object) สำหรับโมดูล Exercise
 * กำหนดรูปแบบข้อมูลขาเข้าและขาออก พร้อม Validation
 */

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];
const CATEGORIES = ['calisthenics', 'cardio', 'weight'];

/**
 * Validate ข้อมูลสร้าง/แก้ไขท่าออกกำลังกาย
 * @param {Object} body
 * @returns {{ valid: boolean, errors: string[] }}
 */
const validateExerciseDto = (body) => {
  const errors = [];
  const { name, difficulty, category } = body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    errors.push('name is required');
  }

  if (difficulty && !DIFFICULTIES.includes(difficulty)) {
    errors.push(`difficulty must be one of: ${DIFFICULTIES.join(', ')}`);
  }

  if (category && !CATEGORIES.includes(category)) {
    errors.push(`category must be one of: ${CATEGORIES.join(', ')}`);
  }

  return { valid: errors.length === 0, errors };
};

const exerciseResponseDto = (exercise) => ({ success: true, data: exercise });

const exerciseListResponseDto = (exercises) => ({ success: true, data: exercises });

module.exports = { validateExerciseDto, exerciseResponseDto, exerciseListResponseDto, DIFFICULTIES, CATEGORIES };
