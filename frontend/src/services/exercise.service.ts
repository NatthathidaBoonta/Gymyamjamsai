/**
 * exercise.service.ts — API calls สำหรับ Exercise endpoints (Phase 5 backend)
 */

import { apiFetch } from './api';

export interface Exercise {
  id: string;
  name: string;
  category: string;
  description?: string;
  media_url?: string;
  instructions?: string;
  created_at: string;
}

export interface CreateExerciseInput {
  name: string;
  category: string;
  description?: string;
}

/** GET /api/exercises — ดึงรายการท่าออกกำลังกาย */
export async function listExercises(limit = 100, offset = 0): Promise<Exercise[]> {
  const response = await apiFetch<any>(`/api/exercises?limit=${limit}&offset=${offset}`);
  return response.items || response || [];
}

/** POST /api/exercises — สร้างท่าใหม่ */
export function createExercise(data: CreateExerciseInput): Promise<Exercise> {
  return apiFetch<Exercise>('/api/exercises', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** PUT /api/exercises/:id — แก้ไขท่า */
export function updateExercise(id: string, data: Partial<CreateExerciseInput>): Promise<Exercise> {
  return apiFetch<Exercise>(`/api/exercises/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/** DELETE /api/exercises/:id — ลบท่า */
export function deleteExercise(id: string): Promise<void> {
  return apiFetch<void>(`/api/exercises/${id}`, {
    method: 'DELETE',
  });
}
