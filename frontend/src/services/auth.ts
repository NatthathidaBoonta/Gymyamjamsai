/**
 * src/services/auth.ts
 *
 * Auth API Service
 * เรียกใช้ /api/auth Endpoints
 */

import api from './api';

// ============================================================
// Types
// ============================================================
export interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    user: User;
  };
}

export interface RegisterPayload {
  email: string;
  password: string;
  name?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

// ============================================================
// API Calls
// ============================================================

/**
 * สมัครสมาชิกใหม่
 */
export const register = async (payload: RegisterPayload): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/api/auth/register', payload);
  return response.data;
};

/**
 * เข้าสู่ระบบ
 */
export const login = async (payload: LoginPayload): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/api/auth/login', payload);
  return response.data;
};

/**
 * ออกจากระบบ (ล้าง Local Storage)
 */
export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/**
 * ดึง Token ปัจจุบัน
 */
export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

/**
 * ดึงข้อมูล User ที่ Login อยู่
 */
export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr) as User;
  } catch {
    return null;
  }
};

/**
 * บันทึก Auth Data หลัง Login สำเร็จ
 */
export const saveAuthData = (token: string, user: User): void => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};
