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
  total_registrations: number;
  avg_attendance_rate: number;
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
