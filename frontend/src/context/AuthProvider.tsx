/**
 * AuthProvider.tsx — จัดการสถานะการเข้าสู่ระบบทั้งแอป
 *
 * - เก็บ JWT ไว้ใน localStorage (ตามที่ระบุใน Implementation Plan Phase 9)
 * - ตอนเปิดแอป ถ้ามี token เก่าอยู่ จะเรียก GET /api/auth/me เพื่อตรวจว่ายังใช้ได้
 * - ลงทะเบียน interceptor: ถ้า API ตอบ 401 ระหว่างใช้งาน จะ logout แล้วพาไปหน้า Login
 */

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext, type AuthContextValue } from './authContext';
import { clearToken, getToken, setToken, setUnauthorizedHandler } from '../services/api';
import * as authService from '../services/auth.service';
import type { Role } from '../routes/navConfig';

function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(() => {
    clearToken();
    setRole(null);
    setUserId(null);
  }, []);

  // ตรวจสอบ token ที่เก็บไว้ตอนเปิดแอป (กันกรณี token หมดอายุระหว่างปิดเบราว์เซอร์)
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      if (!getToken()) {
        setIsLoading(false);
        return;
      }
      try {
        const user = await authService.me();
        if (!cancelled) {
          setRole(user.role);
          setUserId(user.user_id);
        }
      } catch {
        if (!cancelled) clearSession();
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, [clearSession]);

  // Interceptor: 401 ระหว่างใช้งาน → ล้าง session แล้วพาไปหน้า Login
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setRole(null);
      setUserId(null);
      navigate('/login', { replace: true });
    });
    return () => setUnauthorizedHandler(null);
  }, [navigate]);

  const login = useCallback(async (email: string, password: string): Promise<Role> => {
    const result = await authService.login(email, password);
    setToken(result.token);
    setRole(result.role);
    const user = await authService.me();
    setUserId(user.user_id);
    return result.role;
  }, []);

  const register = useCallback(async (email: string, password: string): Promise<Role> => {
    const result = await authService.register(email, password);
    setToken(result.token);
    setUserId(result.user_id);
    setRole('member'); // สมัครใหม่ได้ role member เสมอ (ตาม backend Phase 4)
    return 'member';
  }, []);

  const logout = useCallback(() => {
    clearSession();
    navigate('/login', { replace: true });
  }, [clearSession, navigate]);

  const value = useMemo<AuthContextValue>(
    () => ({
      role,
      userId,
      isAuthenticated: role !== null,
      isLoading,
      login,
      register,
      logout,
    }),
    [role, userId, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
