/**
 * exercise.service.ts — API calls สำหรับคลังท่า (/api/exercises) และข้อเสนอแก้ไข (/api/exercise-suggestions)
 */

import { apiFetch } from './api';

export type ExerciseDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Exercise {
  id: string;
  name: string;
  category: string | null;
  muscle_group: string | null;
  equipment: string | null;
  difficulty: ExerciseDifficulty;
  media_url: string | null;
  instructions: string | null;
  tips: string | null;
  updated_at?: string;
}

export interface ExerciseInput {
  name: string;
  category?: string | null;
  muscle_group?: string | null;
  equipment?: string | null;
  difficulty?: ExerciseDifficulty;
  media_url?: string | null;
  instructions?: string | null;
  tips?: string | null;
}

export interface ExerciseListQuery {
  q?: string;
  category?: string;
  difficulty?: ExerciseDifficulty | '';
  page?: number;
  limit?: number;
}

export interface ExerciseListResult {
  items: Exercise[];
  total: number;
  page: number;
  limit: number;
}

export const DIFFICULTY_LABEL: Record<ExerciseDifficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export const CATEGORY_LABEL: Record<string, string> = {
  strength: 'Strength',
  cardio: 'Cardio',
  flexibility: 'Flexibility',
  calisthenics: 'Calisthenics',
  weight: 'Weight',
};

function buildQuery(params: Record<string, string | number | undefined>): string {
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== '' && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return qs ? `?${qs}` : '';
}

/** GET /api/exercises — ค้นหา/กรอง/แบ่งหน้า (ไม่ต้องล็อกอิน) */
export function searchExercises(query: ExerciseListQuery = {}): Promise<ExerciseListResult> {
  const { q, category, difficulty, page = 1, limit = 100 } = query;
  return apiFetch<ExerciseListResult>(`/api/exercises${buildQuery({ q, category, difficulty, page, limit })}`);
}

/** ดึงทั้งหมดแบบง่าย (ใช้ในหน้าที่ต้องการรายการเต็ม) */
export async function listExercises(limit = 100, offset = 0): Promise<Exercise[]> {
  const page = Math.floor(offset / limit) + 1;
  const result = await searchExercises({ page, limit });
  return result.items;
}

export function getExercise(id: string): Promise<Exercise> {
  return apiFetch<Exercise>(`/api/exercises/${id}`);
}

export function getExerciseStats(): Promise<{ by_category: Array<{ category: string; count: number }> }> {
  return apiFetch('/api/exercises/stats');
}

export function createExercise(data: ExerciseInput): Promise<Exercise> {
  return apiFetch<Exercise>('/api/exercises', { method: 'POST', body: JSON.stringify(data) });
}

export function updateExercise(id: string, data: Partial<ExerciseInput>): Promise<Exercise> {
  return apiFetch<Exercise>(`/api/exercises/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deleteExercise(id: string): Promise<void> {
  return apiFetch<void>(`/api/exercises/${id}`, { method: 'DELETE' });
}

// ---------- ข้อเสนอแก้ไขท่า (Trainer → Admin) ----------

export type SuggestionStatus = 'pending' | 'approved' | 'rejected';

export type SuggestionPayload = Partial<Pick<Exercise, 'name' | 'muscle_group' | 'equipment' | 'difficulty' | 'instructions' | 'tips'>>;

export interface ExerciseSuggestion {
  id: string;
  exercise_id: string;
  exercise_name: string;
  exercise_media_url: string | null;
  trainer_id: string;
  trainer_name: string | null;
  trainer_email: string;
  payload: SuggestionPayload;
  note: string | null;
  status: SuggestionStatus;
  reviewed_by: string | null;
  reviewer_name: string | null;
  review_note: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export const SUGGESTION_STATUS_LABEL: Record<SuggestionStatus, string> = {
  pending: 'รอพิจารณา',
  approved: 'อนุมัติแล้ว',
  rejected: 'ปฏิเสธ',
};

export const SUGGESTABLE_FIELD_LABEL: Record<keyof SuggestionPayload, string> = {
  name: 'ชื่อท่า',
  muscle_group: 'กล้ามเนื้อหลัก',
  equipment: 'อุปกรณ์',
  difficulty: 'ระดับ',
  instructions: 'ขั้นตอน',
  tips: 'ข้อควรระวัง / เคล็ดลับ',
};

export function listSuggestions(status?: SuggestionStatus): Promise<ExerciseSuggestion[]> {
  return apiFetch<ExerciseSuggestion[]>(`/api/exercise-suggestions${buildQuery({ status })}`);
}

export function getPendingSuggestionCount(): Promise<{ count: number }> {
  return apiFetch('/api/exercise-suggestions/pending-count');
}

export function createSuggestion(exerciseId: string, payload: SuggestionPayload, note?: string): Promise<ExerciseSuggestion> {
  return apiFetch<ExerciseSuggestion>('/api/exercise-suggestions', {
    method: 'POST',
    body: JSON.stringify({ exercise_id: exerciseId, ...payload, note }),
  });
}

export function reviewSuggestion(id: string, decision: 'approve' | 'reject', reviewNote?: string): Promise<ExerciseSuggestion> {
  return apiFetch<ExerciseSuggestion>(`/api/exercise-suggestions/${id}/${decision}`, {
    method: 'POST',
    body: JSON.stringify({ review_note: reviewNote }),
  });
}

export function withdrawSuggestion(id: string): Promise<void> {
  return apiFetch<void>(`/api/exercise-suggestions/${id}`, { method: 'DELETE' });
}
