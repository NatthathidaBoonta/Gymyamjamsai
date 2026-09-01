/**
 * workout-plan.router.js — เส้นทาง URL ของ Workout Plan module (เฉพาะ Member)
 */

const express = require('express');
const controller = require('./workout-plan.controller');
const { authenticate, requireRole } = require('../../middleware/auth.middleware');

const router = express.Router();

router.post('/generate', authenticate, requireRole('member'), controller.generate);
router.get('/current', authenticate, requireRole('member'), controller.current);
router.post('/:planId/log', authenticate, requireRole('member'), controller.logWorkout);

module.exports = router;
