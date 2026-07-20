/**
 * api.ts — HTTP client กลางของระบบ
 *
 * ทำหน้าที่เป็น "interceptor" (ตามความเสี่ยงที่ระบุใน Phase 9):
 * ถ้า API ตอบ 401 (token หมดอายุ/ไม่ถูกต้อง) จะล้าง token แล้วแจ้ง AuthProvider
 * ให้พาผู้ใช้กลับไปหน้า Login อัตโนมัติ
 *
 * ใช้ fetch ของเบราว์เซอร์ (ไม่เพิ่ม dependency ภายนอก)
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';
const TOKEN_KEY = 'gym_token';

/** โครงสร้าง response มาตรฐานจาก backend (06-api-contract.md) */
interface ApiEnvelope<T> {
  status: 'success' | 'error';
  message: string;
  data?: T;
  code?: number;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/* ---------- จัดการ token ใน localStorage ---------- */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/* ---------- interceptor สำหรับกรณี 401 ---------- */
type UnauthorizedHandler = () => void;
let onUnauthorized: UnauthorizedHandler | null = null;

/** ให้ AuthProvider ลงทะเบียนสิ่งที่จะทำเมื่อเจอ 401 */
export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  onUnauthorized = handler;
}

/**
 * เรียก API พร้อมแนบ JWT อัตโนมัติ และแกะ envelope ให้เหลือเฉพาะ data
 * @throws {ApiError} เมื่อ response ไม่สำเร็จ
 */
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  } catch {
    throw new ApiError('เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ กรุณาลองใหม่', 0);
  }

  const text = await response.text();
  let body: ApiEnvelope<T> | null = null;
  if (text) {
    try {
      body = JSON.parse(text) as ApiEnvelope<T>;
    } catch {
      body = null;
    }
  }

  // Interceptor: token หมดอายุหรือไม่ถูกต้อง → ล้างแล้วพากลับหน้า Login
  if (response.status === 401) {
    clearToken();
    onUnauthorized?.();
  }

  if (!response.ok) {
    throw new ApiError(body?.message ?? 'เกิดข้อผิดพลาดที่ไม่คาดคิด', response.status);
  }

  return body?.data as T;
}
