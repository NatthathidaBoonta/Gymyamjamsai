/**
 * AppRouter.tsx — นิยามเส้นทางทั้งหมดของระบบ (SPA)
 * เส้นทางอ้างอิงตาม docs/planning/07-frontend-pages.md
 *
 * Phase 9: เส้นทางในกลุ่ม Dashboard ถูกป้องกันด้วย <ProtectedRoute>
 * (ต้องเข้าสู่ระบบ + Role ต้องตรง มิฉะนั้นถูก redirect)
 */

import { Navigate, Route, Routes } from 'react-router-dom';

import PublicLayout from '../layouts/PublicLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';

import Landing from '../pages/public/Landing';
import Login from '../pages/public/Login';
import Register from '../pages/public/Register';

import MemberDashboard from '../pages/member/MemberDashboard';
import Workout from '../pages/member/Workout';
import Activities from '../pages/member/Activities';
import Notifications from '../pages/member/Notifications';
import Profile from '../pages/member/Profile';

import TrainerDashboard from '../pages/trainer/TrainerDashboard';
import TrainerActivities from '../pages/trainer/TrainerActivities';
import Attendance from '../pages/trainer/Attendance';

import AdminDashboard from '../pages/admin/AdminDashboard';
import Users from '../pages/admin/Users';
import Exercises from '../pages/admin/Exercises';
import ExerciseLibrary from '../pages/admin/ExerciseLibrary';

import NotFound from '../pages/NotFound';

function AppRouter() {
  return (
    <Routes>
      {/* ---------- Guest ---------- */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* ไลบรารีท่า — เข้าถึงได้โดยไม่ต้องเข้าสู่ระบบ เพราะ Landing ลิงก์มาที่นี่เป็นตัวอย่างให้ผู้เยี่ยมชม */}
        <Route path="/exercise-library" element={<ExerciseLibrary />} />
      </Route>

      {/* ---------- ต้องเข้าสู่ระบบ (แยกสิทธิ์ตาม Role) ---------- */}
      <Route element={<DashboardLayout />}>
        {/* Member */}
        <Route element={<ProtectedRoute allowedRoles={['member']} />}>
          <Route path="/member" element={<Navigate to="/member/dashboard" replace />} />
          <Route path="/member/dashboard" element={<MemberDashboard />} />
          <Route path="/member/profile" element={<Profile />} />
          <Route path="/member/workout" element={<Workout />} />
          <Route path="/member/activities" element={<Activities />} />
          <Route path="/member/notifications" element={<Notifications />} />
        </Route>

        {/* Trainer */}
        <Route element={<ProtectedRoute allowedRoles={['trainer']} />}>
          <Route path="/trainer" element={<Navigate to="/trainer/dashboard" replace />} />
          <Route path="/trainer/dashboard" element={<TrainerDashboard />} />
          <Route path="/trainer/activities" element={<TrainerActivities />} />
          <Route path="/trainer/activities/:id/attendance" element={<Attendance />} />
        </Route>

        {/* Admin */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<Users />} />
          <Route path="/admin/exercises" element={<Exercises />} />
          <Route path="/admin/exercise-library" element={<ExerciseLibrary />} />
        </Route>
      </Route>

      {/* ---------- 404 ---------- */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRouter;
