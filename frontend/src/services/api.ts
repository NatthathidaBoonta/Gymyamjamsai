/**
 * src/services/api.ts
 *
 * Axios Instance — ศูนย์กลางการเชื่อมต่อ Backend
 * กำหนด baseURL, headers, interceptors
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// ============================================================
// Request Interceptor — แนบ JWT Token อัตโนมัติ
// ============================================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================================
// Response Interceptor — จัดการ Error กลาง
// ============================================================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Token หมดอายุ → ล้าง token และ redirect ไปหน้า login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
