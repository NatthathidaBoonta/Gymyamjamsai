require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { pool, closePool } = require('./src/database');
const { notFoundHandler, errorHandler } = require('./src/middleware/error.middleware');
const authRouter = require('./src/modules/auth/auth.router');
const exerciseRouter = require('./src/modules/exercise/exercise.router');
const workoutPlanRouter = require('./src/modules/workout-plan/workout-plan.router');
const activityRouter = require('./src/modules/activity/activity.router');
const dashboardRouter = require('./src/modules/dashboard/dashboard.router');
const reportRouter = require('./src/modules/report/report.router');
const notificationRouter = require('./src/modules/notification/notification.router');
const userRouter = require('./src/modules/user/user.router');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS: อนุญาต origin ของ frontend (อ่านจาก env) + localhost ทุกพอร์ตตอน dev
// (Vite เปลี่ยนพอร์ตอัตโนมัติเมื่อพอร์ตเดิมชนกัน ทำให้ origin ไม่ตรง .env ได้บ่อย)
const configuredOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (origin === configuredOrigin) return callback(null, true);
    if (/^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
}));

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: false, // ปิดไว้เพื่อให้ React โหลด asset/api ได้ง่ายขึ้นใน single-container
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { status: 'error', code: 429, message: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

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
// นำ app.get('/') ออกเพื่อให้ express.static เสิร์ฟ index.html แทน

// API routes
app.use('/api/auth', authRouter);
app.use('/api/exercises', exerciseRouter);
app.use('/api/workout-plans', workoutPlanRouter);
app.use('/api/activities', activityRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/reports', reportRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/users', userRouter);

// Serve Static Frontend Files (Single Container Production)
app.use(express.static(path.join(__dirname, 'public')));

// Catch-all route to serve React's index.html for non-API requests
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next(); // ให้หลุดไปเจอ 404 ของ API
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 + central error handler (ต้องอยู่ท้ายสุดเสมอ)
app.use(notFoundHandler);
app.use(errorHandler);

const cronService = require('./src/services/cron.service');

const server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  
  // Initialize Cron Jobs
  cronService.startCronJobs();
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
