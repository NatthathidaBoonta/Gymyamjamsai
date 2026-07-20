/**
 * activity.service.ts — API calls สำหรับ Activity endpoints (Phase 6 backend)
 */

import { apiFetch } from './api';

export interface Activity {
  id: string;
  title: string;
  trainer_id: string;
  trainer_name?: string;
  start_datetime: string;
  max_participants: number;
  current_participants: number;
  description?: string;
}

export interface ActivityWithParticipants extends Activity {
  participants: Array<{
    user_id: string;
    name: string;
    attended: boolean;
  }>;
}

/** GET /api/activities — ดึงรายการคลาสทั้งหมด */
export function listActivities(): Promise<Activity[]> {
  return apiFetch<Activity[]>('/api/activities');
}

/** POST /api/activities/:id/register — ลงทะเบียนเข้าคลาส */
export function registerActivity(activityId: string): Promise<void> {
  return apiFetch<void>(`/api/activities/${activityId}/register`, {
    method: 'POST',
  });
}

/** GET /api/activities/:id/participants — ดึงรายชื่อผู้เข้าร่วม (Trainer only) */
export function getActivityParticipants(
  activityId: string,
): Promise<Array<{ user_id: string; name: string; attended: boolean }>> {
  return apiFetch<Array<{ user_id: string; name: string; attended: boolean }>>(
    `/api/activities/${activityId}/participants`,
  );
}

/** PATCH /api/activities/:id/attendance — เช็คชื่อเข้าร่วม (Trainer only) */
export function markAttendance(activityId: string, userId: string, attended: boolean): Promise<void> {
  return apiFetch<void>(`/api/activities/${activityId}/attendance`, {
    method: 'PATCH',
    body: JSON.stringify({ user_id: userId, attended }),
  });
}
