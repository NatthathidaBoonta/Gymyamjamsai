/**
 * src/services/workoutPlan.ts
 *
 * Workout Plan API Service
 * เรียกใช้ /api/workout-plan Endpoints
 */

import api from './api';
import type { ExerciseCategory, ExerciseDifficulty } from './exercise';

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface PlanExercise {
  id: string;
  planId: string;
  exerciseId: string;
  sets: number | null;
  reps: number | null;
  weightKg: number | null;
  dayOfWeek: DayOfWeek;
  createdAt: string;
  exerciseName: string;
  targetMuscle: string | null;
  equipment: string | null;
  category: ExerciseCategory | null;
  difficulty: ExerciseDifficulty | null;
  mediaUrl: string | null;
}

export interface WorkoutPlan {
  id: string;
  userId: string;
  name: string;
  startDate: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  details: PlanExercise[];
}

export interface WorkoutPlanResponse {
  success: boolean;
  data: WorkoutPlan;
}

export interface PlanExerciseResponse {
  success: boolean;
  data: PlanExercise;
}

export interface AddPlanExercisePayload {
  exerciseId: string;
  dayOfWeek: DayOfWeek;
  sets?: number;
  reps?: number;
  weightKg?: number;
}

export interface UpdatePlanExercisePayload {
  dayOfWeek: DayOfWeek;
  sets?: number;
  reps?: number;
  weightKg?: number;
}

// ============================================================
// API Calls
// ============================================================

/**
 * ดึงตารางออกกำลังกายของผู้ใช้ปัจจุบัน (สร้างให้อัตโนมัติถ้ายังไม่มี)
 */
export const getMyWorkoutPlan = async (): Promise<WorkoutPlanResponse> => {
  const response = await api.get<WorkoutPlanResponse>('/api/workout-plan');
  return response.data;
};

/**
 * เพิ่มท่าออกกำลังกายลงในตาราง
 */
export const addPlanExercise = async (payload: AddPlanExercisePayload): Promise<PlanExerciseResponse> => {
  const response = await api.post<PlanExerciseResponse>('/api/workout-plan/exercises', payload);
  return response.data;
};

/**
 * แก้ไขท่าออกกำลังกายในตาราง
 */
export const updatePlanExercise = async (
  detailId: string,
  payload: UpdatePlanExercisePayload
): Promise<PlanExerciseResponse> => {
  const response = await api.put<PlanExerciseResponse>(`/api/workout-plan/exercises/${detailId}`, payload);
  return response.data;
};

/**
 * ลบท่าออกกำลังกายออกจากตาราง
 */
export const removePlanExercise = async (detailId: string): Promise<void> => {
  await api.delete(`/api/workout-plan/exercises/${detailId}`);
};
