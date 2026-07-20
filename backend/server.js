require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { pool, closePool } = require('./src/database');
const { notFoundHandler, errorHandler } = require('./src/middleware/error.middleware');
const authRouter = require('./src/modules/auth/auth.router');
const exerciseRouter = require('./src/modules/exercise/exercise.router');
const workoutPlanRouter = require('./src/modules/workout-plan/workout-plan.router');
const activityRouter = require('./src/modules/activity/activity.router');
const dashboardRouter = require('./src/modules/dashboard/dashboard.router');
const reportRouter = require('./src/modules/report/report.router');
const notificationRouter = require('./src/modules/notification/notification.router');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS: อนุญาตเฉพาะ origin ของ frontend (อ่านจาก env)
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173' }));

// Parse JSON body
app.use(express.json());

// Health check — พิสูจน์ว่าเชื่อมต่อ DB ได้จริงโดยดึงข้อมูลจากตาราง users
app.get('/api/health', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT COUNT(*) AS userCount FROM users');
    res.status(200).json({
      status: 'ok',
      db: 'connected',
      userCount: rows[0].userCount,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err); // ส่งต่อให้ central error handler
  }
});

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Gymyamjamsai backend is running' });
});

// API routes
app.use('/api/auth', authRouter);
app.use('/api/exercises', exerciseRouter);
app.use('/api/workout-plans', workoutPlanRouter);
app.use('/api/activities', activityRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/reports', reportRouter);
app.use('/api/notifications', notificationRouter);

// 404 + central error handler (ต้องอยู่ท้ายสุดเสมอ)
app.use(notFoundHandler);
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

/**
 * Graceful shutdown — ปิด HTTP server และ MySQL pool ให้เรียบร้อย
 * ป้องกัน connection ค้าง (ความเสี่ยงที่ระบุใน Phase 3)
 */
async function shutdown(signal) {
  console.log(`\n${signal} received — shutting down gracefully...`);
  server.close(async () => {
    await closePool();
    console.log('MySQL pool closed. Bye.');
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
