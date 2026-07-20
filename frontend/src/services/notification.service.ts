/**
 * notification.service.ts — API calls สำหรับ Notification endpoints
 */

import { apiFetch } from './api';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'activity' | 'workout' | 'system' | 'reminder';
  related_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationListResponse {
  notifications: Notification[];
  unread_count: number;
}

/** GET /api/notifications — ดึงรายการ notifications */
export async function listNotifications(limit = 20, offset = 0): Promise<NotificationListResponse> {
  return apiFetch<NotificationListResponse>(
    `/api/notifications?limit=${limit}&offset=${offset}`
  );
}

/** GET /api/notifications/unread-count — นับ unread */
export async function getUnreadCount(): Promise<{ count: number }> {
  return apiFetch<{ count: number }>('/api/notifications/unread-count');
}

/** PATCH /api/notifications/:id/read — mark as read */
export async function markAsRead(notificationId: string): Promise<void> {
  return apiFetch<void>(`/api/notifications/${notificationId}/read`, {
    method: 'PATCH',
  });
}

/** POST /api/notifications/read-all — mark all as read */
export async function markAllAsRead(): Promise<void> {
  return apiFetch<void>('/api/notifications/read-all', {
    method: 'POST',
  });
}

/** DELETE /api/notifications/:id — ลบ notification */
export async function deleteNotification(notificationId: string): Promise<void> {
  return apiFetch<void>(`/api/notifications/${notificationId}`, {
    method: 'DELETE',
  });
}
