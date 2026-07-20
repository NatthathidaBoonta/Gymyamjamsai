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
export async function getCurrentWorkoutPlan(): Promise<WorkoutPlan> {
  const data = await apiFetch<any>('/api/workout-plans/current');
  return transformPlan(data, 'general');
}

/** POST /api/workout-plans/generate — ขอตารางท่าใหม่ */
export async function generateWorkoutPlan(goal: string): Promise<WorkoutPlan> {
  const data = await apiFetch<any>('/api/workout-plans/generate', {
    method: 'POST',
    body: JSON.stringify({ goal }),
  });
  return transformPlan(data, goal);
}

function transformPlan(data: any, goal: string): WorkoutPlan {
  const dayOfWeekToNumber: Record<string, number> = {
    'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4,
    'Friday': 5, 'Saturday': 6, 'Sunday': 7,
  };

  return {
    id: data.id,
    goal,
    created_at: data.created_at,
    details: (data.details || []).map((d: any) => ({
      id: d.id,
      exercise_id: d.exercise_id,
      exercise: {
        id: d.exercise_id,
        name: d.exercise_name,
        category: d.category,
      },
      day: dayOfWeekToNumber[d.day_of_week] || 1,
      notes: d.notes || undefined,
    })),
  };
}
