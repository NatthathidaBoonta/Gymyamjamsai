/**
 * dashboard.service.ts — API calls สำหรับ Dashboard endpoints (Phase 7 backend)
 */

import { apiFetch } from './api';

export interface DashboardPersonal {
  weight_trend: Array<{ date: string; weight: number }>;
  workout_frequency: Array<{ date: string; count: number }>;
  attendance_rate: number;
}

export interface DashboardAdmin {
  total_users: number;
  total_activities: number;
  total_exercises: number;
  total_registrations: number;
  average_attendance_rate: number;
}

export interface DashboardAdminCharts {
  popular_activities: Array<{ id: string; title: string; max_participants: number; start_datetime: string | null; status: string; registrations: number; trainer_name: string | null }>;
  new_users_by_week: Array<{ week: string; count: number }>;
  users_by_role: Array<{ role: 'member' | 'trainer' | 'admin'; count: number }>;
  registrations_by_day: Array<{ date: string; count: number }>;
  exercises_by_category: Array<{ category: string; count: number }>;
  pending_suggestions: number;
  active_members_7d: number;
}

export interface DashboardTrainer {
  courses: { total: number; open: number; full: number; closed: number; upcoming: number };
  total_registrations: number;
  pending_requests: number;
  upcoming_courses: Array<{ id: string; title: string; start_datetime: string | null; max_participants: number; status: string; registrations: number }>;
  suggestions: { pending: number; approved: number; rejected: number };
}

/** GET /api/dashboard/personal — ดึงข้อมูล dashboard สมาชิก (มีการกรอง date range) */
export function getPersonalDashboard(startDate?: string, endDate?: string): Promise<DashboardPersonal> {
  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  const query = params.toString();
  return apiFetch<DashboardPersonal>(`/api/dashboard/personal${query ? '?' + query : ''}`);
}

/** GET /api/dashboard/admin — ดึงข้อมูล dashboard ผู้ดูแลระบบ */
export function getAdminDashboard(): Promise<DashboardAdmin> {
  return apiFetch<DashboardAdmin>('/api/dashboard/admin');
}

/** GET /api/dashboard/admin/charts — ข้อมูลกราฟ */
export function getAdminCharts(): Promise<DashboardAdminCharts> {
  return apiFetch<DashboardAdminCharts>('/api/dashboard/admin/charts');
}

/** GET /api/dashboard/trainer — ภาพรวมผู้ฝึกสอน */
export function getTrainerDashboard(): Promise<DashboardTrainer> {
  return apiFetch<DashboardTrainer>('/api/dashboard/trainer');
}
