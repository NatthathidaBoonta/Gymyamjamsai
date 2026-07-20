/**
 * workout.service.ts — API calls สำหรับ Workout endpoints (Phase 5 backend)
 */

import { apiFetch } from './api';

export interface ExerciseData {
  id: string;
  name: string;
  category: string;
  description?: string;
}

export interface WorkoutPlan {
  id: string;
  goal: string;
  created_at: string;
  details: WorkoutDetail[];
}

export interface WorkoutDetail {
  id: string;
  exercise_id: string;
  exercise: ExerciseData;
  day: number;
  notes?: string;
}

/** GET /api/workout-plans/current — ดึงตารางท่าปัจจุบัน */
export function getCurrentWorkoutPlan(): Promise<WorkoutPlan> {
  return apiFetch<WorkoutPlan>('/api/workout-plans/current');
}

/** POST /api/workout-plans/generate — ขอตารางท่าใหม่ */
export function generateWorkoutPlan(goal: string): Promise<WorkoutPlan> {
  return apiFetch<WorkoutPlan>('/api/workout-plans/generate', {
    method: 'POST',
    body: JSON.stringify({ goal }),
  });
}
