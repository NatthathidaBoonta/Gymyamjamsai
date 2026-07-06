/**
 * src/routes/ProtectedRoute.tsx
 *
 * Protected Route Component
 * ตรวจสอบ Token ก่อน render - ถ้าไม่มี Token redirect ไปหน้า Landing (/welcome)
 */

import { Navigate, Outlet } from 'react-router-dom';
import { getToken } from '../services/auth';

interface ProtectedRouteProps {
  redirectTo?: string;
}

export default function ProtectedRoute({ redirectTo = '/welcome' }: ProtectedRouteProps) {
  const token = getToken();

  if (!token) {
    return <Navigate to={redirectTo} replace />;
  }

  // ถ้ามี Token → render children (Outlet)
  return <Outlet />;
}
