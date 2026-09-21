/**
 * chat.service.ts — แชทกลุ่มของคอร์ส: REST (ห้อง/ประวัติ/fallback ส่ง) + Socket.IO (เรียลไทม์)
 */

import { io, type Socket } from 'socket.io-client';
import { apiFetch, BASE_URL, getToken } from './api';

export interface ChatMessage {
  id: string;
  activity_id: string;
  sender_id: string;
  message: string;
  created_at: string;
  /** เวลาเป็น ms (คำนวณฝั่ง MySQL) — ใช้เป็น cursor `after` */
  created_ms: number;
  role: 'member' | 'trainer' | 'admin';
  first_name: string | null;
  last_name: string | null;
}

export interface ChatRoom {
  id: string;
  title: string;
  status: 'open' | 'full' | 'closed';
  can_send: boolean;
}

export const CHAT_MAX_LEN = 2000;

export function getRoom(activityId: string): Promise<ChatRoom> {
  return apiFetch<ChatRoom>(`/api/chat/activities/${activityId}`);
}

export function getMessages(activityId: string, after?: number): Promise<ChatMessage[]> {
  const qs = after ? `?after=${after}` : '';
  return apiFetch<ChatMessage[]>(`/api/chat/activities/${activityId}/messages${qs}`);
}

/** fallback เมื่อ socket ต่อไม่ได้ */
export function sendMessageRest(activityId: string, message: string): Promise<ChatMessage> {
  return apiFetch<ChatMessage>(`/api/chat/activities/${activityId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
}

/** เปิด socket ด้วย token ปัจจุบัน (ผู้เรียกรับผิดชอบ disconnect) */
export function connectChat(): Socket {
  return io(BASE_URL, {
    auth: { token: getToken() ?? '' },
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
  });
}

export type SocketAck = { success: true; data?: ChatMessage; can_send?: boolean } | { success: false; error: string };
