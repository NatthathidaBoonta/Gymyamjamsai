/**
 * auth.service.ts — เรียก API กลุ่ม Authentication (Phase 4 backend)
 */

import { apiFetch } from './api';
import type { Role } from '../routes/navConfig';

export interface LoginResult {
  token: string;
  role: Role;
}

export interface RegisterResult {
  token: string;
  user_id: string;
}

export interface CurrentUser {
  user_id: string;
  role: Role;
}

/** POST /api/auth/login — เข้าสู่ระบบ คืน token + role */
export function login(email: string, password: string): Promise<LoginResult> {
  return apiFetch<LoginResult>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

/** POST /api/auth/register — สมัครสมาชิก (ได้ role member เสมอ) */
export function register(email: string, password: string): Promise<RegisterResult> {
  return apiFetch<RegisterResult>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

/** GET /api/auth/me — ตรวจสอบ token ที่เก็บไว้ว่ายังใช้ได้ และดึง role ปัจจุบัน */
export function me(): Promise<CurrentUser> {
  return apiFetch<CurrentUser>('/api/auth/me');
}
