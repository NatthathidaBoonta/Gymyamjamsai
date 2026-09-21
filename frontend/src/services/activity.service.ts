/**
 * activity.service.ts — API calls สำหรับ Activity endpoints (Phase 6 backend)
 */

import { apiFetch } from './api';

export type ActivityStatus = 'open' | 'full' | 'closed';
export type RegistrationStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export const REGISTRATION_LABEL: Record<RegistrationStatus, string> = {
  pending: 'รออนุมัติ',
  approved: 'อนุมัติแล้ว',
  rejected: 'ปฏิเสธ',
  cancelled: 'ยกเลิก',
};

export interface Activity {
  id: string;
  title: string;
  trainer_id: string;
  trainer_name: string | null;
  start_datetime: string | null;
  max_participants: number;
  current_participants: number;
  /** จำนวนคำขอที่รออนุมัติ (trainer ใช้) */
  pending_count: number;
  available_seats: number;
  status: ActivityStatus;
  is_registered: boolean;
  /** สถานะการจองของผู้เรียก (null = ยังไม่ได้จอง) — pending รออนุมัติ · approved เข้าคอร์ส/แชทได้ */
  registration_status: RegistrationStatus | null;
  description?: string | null;
}

export interface ActivityInput {
  title: string;
  description?: string;
  start_datetime?: string;
  max_participants: number;
}

export interface Participant {
  user_id: string;
  name: string | null;
  email: string;
  attended: boolean;
  status: RegistrationStatus;
  registered_at: string;
}

/** GET /api/activities — ดึงรายการคลาสทั้งหมด (พร้อม is_registered ของผู้เรียก) */
export function listActivities(): Promise<Activity[]> {
  return apiFetch<Activity[]>('/api/activities');
}

/** POST /api/activities — trainer สร้างคลาส */
export function createActivity(data: ActivityInput): Promise<{ id: string; status: ActivityStatus }> {
  return apiFetch('/api/activities', { method: 'POST', body: JSON.stringify(data) });
}

/** PUT /api/activities/:id — trainer แก้ไขคลาสของตัวเอง */
export function updateActivity(activityId: string, data: ActivityInput): Promise<{ id: string }> {
  return apiFetch(`/api/activities/${activityId}`, { method: 'PUT', body: JSON.stringify(data) });
}

/** DELETE /api/activities/:id — trainer ยกเลิกคลาส (แจ้งเตือนผู้ที่จองไว้อัตโนมัติ) */
export function cancelActivity(activityId: string): Promise<{ id: string; status: 'closed'; notified: number }> {
  return apiFetch(`/api/activities/${activityId}`, { method: 'DELETE' });
}

/** POST /api/activities/:id/register — member ลงทะเบียนเข้าคลาส */
export function registerActivity(activityId: string): Promise<void> {
  return apiFetch<void>(`/api/activities/${activityId}/register`, { method: 'POST' });
}

/** DELETE /api/activities/:id/register — member ยกเลิกการจองของตัวเอง */
export function unregisterActivity(activityId: string): Promise<void> {
  return apiFetch<void>(`/api/activities/${activityId}/register`, { method: 'DELETE' });
}

/** GET /api/activities/:id/participants — รายชื่อผู้เข้าร่วม (trainer เจ้าของ) */
export function getActivityParticipants(activityId: string): Promise<Participant[]> {
  return apiFetch<Participant[]>(`/api/activities/${activityId}/participants`);
}

/** PATCH /api/activities/:id/attendance — เช็คชื่อ (trainer เจ้าของ) */
export function markAttendance(activityId: string, userId: string, attended: boolean): Promise<void> {
  return apiFetch<void>(`/api/activities/${activityId}/attendance`, {
    method: 'PATCH',
    body: JSON.stringify({ user_id: userId, attended }),
  });
}

/** PATCH /api/activities/:id/participants/:userId/approve — trainer อนุมัติผู้สมัคร */
export function approveParticipant(activityId: string, userId: string): Promise<{ user_id: string; status: 'approved' }> {
  return apiFetch(`/api/activities/${activityId}/participants/${userId}/approve`, { method: 'PATCH' });
}

/** PATCH /api/activities/:id/participants/:userId/reject — trainer ปฏิเสธผู้สมัคร (คืนที่นั่ง) */
export function rejectParticipant(activityId: string, userId: string): Promise<{ user_id: string; status: 'rejected' }> {
  return apiFetch(`/api/activities/${activityId}/participants/${userId}/reject`, { method: 'PATCH' });
}
