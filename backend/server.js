/**
 * server.js
 * 
 * Entry Point — Gymyamjamsai Backend API
 * Node.js + Express + MySQL (Modular Monolith)
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Routers
const statusRouter = require('./src/modules/status/status.router');
const authRouter = require('./src/modules/auth/auth.router');
const profileRouter = require('./src/modules/profile/profile.router');
const exerciseRouter = require('./src/modules/exercise/exercise.router');
const workoutPlanRouter = require('./src/modules/workout-plan/workout-plan.router');

// Middleware
const { errorMiddleware, notFoundMiddleware } = require('./src/middleware/error.middleware');

// ============================================================
// App Setup
// ============================================================
const app = express();
const PORT = process.env.PORT || 5001;

// ============================================================
// Global Middleware
// ============================================================
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================================
// Routes
// ============================================================
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Gymyamjamsai API',
    version: '1.0.0',
    docs: {
      status: '/api/status',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
      },
      profile: {
        get: 'GET /api/profile/me',
        save: 'PUT /api/profile/me',
      },
      exercises: {
        list: 'GET /api/exercises',
        detail: 'GET /api/exercises/:id',
        create: 'POST /api/exercises (admin)',
        update: 'PUT /api/exercises/:id (admin)',
        remove: 'DELETE /api/exercises/:id (admin)',
      },
      workoutPlan: {
        get: 'GET /api/workout-plan',
        addExercise: 'POST /api/workout-plan/exercises',
        updateExercise: 'PUT /api/workout-plan/exercises/:detailId',
        removeExercise: 'DELETE /api/workout-plan/exercises/:detailId',
      },
    },
  });
});

// Module Routers
app.use('/api/status', statusRouter);
app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);
app.use('/api/exercises', exerciseRouter);
app.use('/api/workout-plan', workoutPlanRouter);

// ============================================================
// Error Handling (ต้องอยู่หลัง Routes เสมอ)
// ============================================================
app.use(notFoundMiddleware);
app.use(errorMiddleware);

// ============================================================
// Start Server
// ============================================================
app.listen(PORT, () => {
  console.log('========================================');
  console.log(`🏋️  Gymyamjamsai API`);
  console.log(`📦 Environment : ${process.env.NODE_ENV || 'development'}`);
  console.log(`🚀 Server      : http://localhost:${PORT}`);
  console.log(`🔍 Status      : http://localhost:${PORT}/api/status`);
  console.log('========================================');
});

module.exports = app;
