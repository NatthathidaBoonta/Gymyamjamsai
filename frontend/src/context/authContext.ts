/**
 * authContext.ts — นิยาม Context ของระบบ Authentication
 * (แยกจากไฟล์ Provider เพื่อให้ไฟล์คอมโพเนนต์ export เฉพาะคอมโพเนนต์)
 */

import { createContext } from 'react';
import type { Role } from '../routes/navConfig';

export interface AuthContextValue {
  /** null = ยังไม่เข้าสู่ระบบ */
  role: Role | null;
  userId: string | null;
  isAuthenticated: boolean;
  /** true ระหว่างตรวจสอบ token ที่เก็บไว้ตอนเปิดแอป */
  isLoading: boolean;
  login: (email: string, password: string) => Promise<Role>;
  register: (email: string, password: string) => Promise<Role>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
