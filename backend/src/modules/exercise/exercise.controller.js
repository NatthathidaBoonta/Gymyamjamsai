/**
 * src/modules/exercise/exercise.controller.js
 *
 * Controller สำหรับโมดูล Exercise
 * รับ HTTP Request, เรียกใช้ Service, ส่ง Response
 */

const {
  listExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise,
} = require('./exercise.service');
const { validateExerciseDto, exerciseResponseDto, exerciseListResponseDto } = require('./exercise.dto');

/**
 * GET /api/exercises
 * @desc  แสดงรายการท่าออกกำลังกายทั้งหมด (รองรับ query: targetMuscle, difficulty, search)
 * @access Private
 */
const listController = async (req, res, next) => {
  try {
    const { targetMuscle, equipment, category, difficulty, search } = req.query;
    const exercises = await listExercises({ targetMuscle, equipment, category, difficulty, search });
    res.status(200).json(exerciseListResponseDto(exercises));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/exercises/:id
 * @access Private
 */
const getByIdController = async (req, res, next) => {
  try {
    const exercise = await getExerciseById(req.params.id);
    res.status(200).json(exerciseResponseDto(exercise));
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/exercises
 * @access Private (admin)
 */
const createController = async (req, res, next) => {
  try {
    const { valid, errors } = validateExerciseDto(req.body);
    if (!valid) {
      return res.status(400).json({ success: false, errors });
    }
    const exercise = await createExercise(req.body);
    res.status(201).json(exerciseResponseDto(exercise));
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/exercises/:id
 * @access Private (admin)
 */
const updateController = async (req, res, next) => {
  try {
    const { valid, errors } = validateExerciseDto(req.body);
    if (!valid) {
      return res.status(400).json({ success: false, errors });
    }
    const exercise = await updateExercise(req.params.id, req.body);
    res.status(200).json(exerciseResponseDto(exercise));
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/exercises/:id
 * @access Private (admin)
 */
const deleteController = async (req, res, next) => {
  try {
    await deleteExercise(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = { listController, getByIdController, createController, updateController, deleteController };
