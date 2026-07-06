/**
 * src/services/exercise.ts
 *
 * Exercise API Service
 * เรียกใช้ /api/exercises Endpoints
 */

import api from './api';

// ============================================================
// Types
// ============================================================
export type ExerciseDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type ExerciseCategory = 'calisthenics' | 'cardio' | 'weight';

export interface Exercise {
  id: string;
  name: string;
  targetMuscle: string | null;
  equipment: string | null;
  category: ExerciseCategory | null;
  difficulty: ExerciseDifficulty | null;
  mediaUrl: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExerciseListResponse {
  success: boolean;
  data: Exercise[];
}

export interface ExerciseFilters {
  targetMuscle?: string;
  equipment?: string;
  category?: ExerciseCategory | '';
  difficulty?: ExerciseDifficulty | '';
  search?: string;
}

// ============================================================
// API Calls
// ============================================================

/**
 * ดึงรายการท่าออกกำลังกาย รองรับ filter ตาม targetMuscle / difficulty / search
 */
export const listExercises = async (filters: ExerciseFilters = {}): Promise<ExerciseListResponse> => {
  const params: Record<string, string> = {};
  if (filters.targetMuscle) params.targetMuscle = filters.targetMuscle;
  if (filters.equipment) params.equipment = filters.equipment;
  if (filters.category) params.category = filters.category;
  if (filters.difficulty) params.difficulty = filters.difficulty;
  if (filters.search) params.search = filters.search;

  const response = await api.get<ExerciseListResponse>('/api/exercises', { params });
  return response.data;
};
