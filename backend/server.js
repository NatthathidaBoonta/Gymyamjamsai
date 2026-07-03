/**
 * server.js
 * 
 * Entry Point — Gymyamjamsai Backend API
 * Node.js + Express + Prisma (Modular Monolith)
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Routers
const statusRouter = require('./src/modules/status/status.router');
const authRouter = require('./src/modules/auth/auth.router');

// Middleware
const { errorMiddleware, notFoundMiddleware } = require('./src/middleware/error.middleware');

// ============================================================
// App Setup
// ============================================================
const app = express();
const PORT = process.env.PORT || 3000;

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
    },
  });
});

// Module Routers
app.use('/api/status', statusRouter);
app.use('/api/auth', authRouter);

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
