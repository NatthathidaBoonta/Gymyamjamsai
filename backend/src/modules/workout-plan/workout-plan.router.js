/**
 * src/modules/workout-plan/workout-plan.router.js
 *
 * Router สำหรับโมดูล Workout Plan
 * กำหนด Endpoint ทั้งหมดของ /api/workout-plan
 */

const express = require('express');
const { authMiddleware } = require('../../middleware/auth.middleware');
const controller = require('./workout-plan.controller');

const router = express.Router();

router.get('/', authMiddleware, controller.getMyPlanController);
router.post('/exercises', authMiddleware, controller.addExerciseController);
router.put('/exercises/:detailId', authMiddleware, controller.updateExerciseController);
router.delete('/exercises/:detailId', authMiddleware, controller.removeExerciseController);

module.exports = router;
