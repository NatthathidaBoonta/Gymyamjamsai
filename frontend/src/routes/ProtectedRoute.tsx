/**
 * ProtectedRoute.tsx — ป้องกันเส้นทางตามสถานะการเข้าสู่ระบบและสิทธิ์ (Role)
 *
 * - ยังไม่เข้าสู่ระบบ           → ส่งไปหน้า /login (จำหน้าเดิมไว้ใน state.from)
 * - เข้าสู่ระบบแล้วแต่ Role ไม่ตรง → ส่งกลับหน้าแรกของ Role ตัวเอง (ตาม Acceptance Criteria)
 */

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { HOME_BY_ROLE, type Role } from './navConfig';

interface Props {
  /** ถ้าไม่ระบุ = แค่ต้องเข้าสู่ระบบก็พอ */
  allowedRoles?: Role[];
}

function ProtectedRoute({ allowedRoles }: Props) {
  const { isAuthenticated, isLoading, role } = useAuth();
  const location = useLocation();

  // รอตรวจสอบ token ที่เก็บไว้ก่อน กัน redirect ผิดจังหวะตอน refresh หน้า
  if (isLoading) {
    return <p style={{ padding: '2rem', textAlign: 'center' }}>กำลังตรวจสอบสิทธิ์...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to={HOME_BY_ROLE[role]} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
