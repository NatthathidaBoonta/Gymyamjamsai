/**
 * src/modules/workout-plan/workout-plan.controller.js
 *
 * Controller สำหรับโมดูล Workout Plan
 * รับ HTTP Request, เรียกใช้ Service, ส่ง Response
 */

const {
  getMyPlan,
  addExerciseToPlan,
  updatePlanExercise,
  removePlanExercise,
} = require('./workout-plan.service');
const {
  validateAddPlanExerciseDto,
  validateUpdatePlanExerciseDto,
  planResponseDto,
  planExerciseResponseDto,
} = require('./workout-plan.dto');

/**
 * GET /api/workout-plan
 * @desc  ดึงตารางออกกำลังกายของ user ปัจจุบัน (สร้างให้อัตโนมัติถ้ายังไม่มี)
 * @access Private
 */
const getMyPlanController = async (req, res, next) => {
  try {
    const plan = await getMyPlan(req.user.id);
    res.status(200).json(planResponseDto(plan));
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/workout-plan/exercises
 * @desc  เพิ่มท่าออกกำลังกายลงในตาราง
 * @access Private
 */
const addExerciseController = async (req, res, next) => {
  try {
    const { valid, errors } = validateAddPlanExerciseDto(req.body);
    if (!valid) {
      return res.status(400).json({ success: false, errors });
    }
    const detail = await addExerciseToPlan(req.user.id, req.body);
    res.status(201).json(planExerciseResponseDto(detail));
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/workout-plan/exercises/:detailId
 * @desc  แก้ไขท่าออกกำลังกายในตาราง
 * @access Private
 */
const updateExerciseController = async (req, res, next) => {
  try {
    const { valid, errors } = validateUpdatePlanExerciseDto(req.body);
    if (!valid) {
      return res.status(400).json({ success: false, errors });
    }
    const detail = await updatePlanExercise(req.user.id, req.params.detailId, req.body);
    res.status(200).json(planExerciseResponseDto(detail));
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/workout-plan/exercises/:detailId
 * @desc  ลบท่าออกกำลังกายออกจากตาราง
 * @access Private
 */
const removeExerciseController = async (req, res, next) => {
  try {
    await removePlanExercise(req.user.id, req.params.detailId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyPlanController,
  addExerciseController,
  updateExerciseController,
  removeExerciseController,
};
