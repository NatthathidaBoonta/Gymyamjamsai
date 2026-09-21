/**
 * notificationLink.ts — แปลงแจ้งเตือนเป็นปลายทางที่ควรพาไป + ไอคอน ตามชนิดและบทบาท
 */

import type { Role } from '../routes/navConfig';

export type NotificationType = 'activity' | 'chat' | 'suggestion' | 'system' | 'workout' | 'reminder' | 'sla_warning';

export function notificationLink(type: string, relatedId: string | null | undefined, role: Role | null): string | null {
  switch (type) {
    case 'chat':
      return relatedId ? `/activities/${relatedId}/chat` : null;
    case 'activity':
      if (role === 'trainer') return '/trainer/activities';
      if (role === 'member') return '/member/activities';
      return null;
    case 'suggestion':
      return role === 'admin' ? '/admin/suggestions' : '/trainer/exercises';
    case 'system':
      return role === 'trainer' ? '/trainer/exercises' : null;
    case 'workout':
    case 'reminder':
    case 'sla_warning':
      return role === 'member' ? '/member/workout' : null;
    default:
      return null;
  }
}

export function notificationIcon(type: string): string {
  switch (type) {
    case 'chat': return 'ri-chat-3-line';
    case 'activity': return 'ri-calendar-event-line';
    case 'suggestion': return 'ri-git-pull-request-line';
    case 'system': return 'ri-information-line';
    case 'workout':
    case 'reminder':
    case 'sla_warning': return 'ri-run-line';
    default: return 'ri-notification-3-line';
  }
}

/** เวลาแบบสัมพัทธ์ (เมื่อสักครู่ / 5 นาทีที่แล้ว / เมื่อวาน …) */
export function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'เมื่อสักครู่';
  if (diff < 3600) return `${Math.floor(diff / 60)} นาทีที่แล้ว`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ชั่วโมงที่แล้ว`;
  if (diff < 172800) return 'เมื่อวาน';
  return new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
}
