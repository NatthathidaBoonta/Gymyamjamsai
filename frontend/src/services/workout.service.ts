/**
 * workout.service.ts — API calls สำหรับตารางออกกำลังกาย (/api/workout-plans)
 * ข้อมูลท่าในแผนมาจาก join กับ exercises จึงมีฟิลด์รายละเอียดครบ (ใช้เปิด dialog ได้ทันที)
 */

import { apiFetch } from './api';
import type { Exercise, ExerciseDifficulty } from './exercise.service';

export type PlanGoal = 'lose_weight' | 'build_muscle' | 'general';

export const GOAL_LABEL: Record<PlanGoal, string> = {
  lose_weight: 'ลดน้ำหนัก',
  build_muscle: 'เพิ่มกล้ามเนื้อ',
  general: 'ฟิตทั่วไป',
};

export const GOAL_DESC: Record<PlanGoal, string> = {
  lose_weight: '4 วัน/สัปดาห์ · Cardio นำ + Strength เบา reps สูง',
  build_muscle: '3 วัน/สัปดาห์ · ท่าหลัก 4 sets × 8–12 reps เน้นเพิ่มน้ำหนัก',
  general: '3 วัน/สัปดาห์ · ผสม Strength และ Cardio สำหรับเริ่มต้นหรือรักษาสภาพ',
};

export const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
export type DayOfWeek = (typeof DAY_ORDER)[number];

export const DAY_LABEL: Record<DayOfWeek, string> = {
  Monday: 'จันทร์',
  Tuesday: 'อังคาร',
  Wednesday: 'พุธ',
  Thursday: 'พฤหัสบดี',
  Friday: 'ศุกร์',
  Saturday: 'เสาร์',
  Sunday: 'อาทิตย์',
};

export const DAY_SHORT: Record<DayOfWeek, string> = {
  Monday: 'จ.',
  Tuesday: 'อ.',
  Wednesday: 'พ.',
  Thursday: 'พฤ.',
  Friday: 'ศ.',
  Saturday: 'ส.',
  Sunday: 'อา.',
};

export interface PlanDetail {
  id: string;
  exercise_id: string;
  exercise_name: string;
  category: string | null;
  muscle_group: string | null;
  equipment: string | null;
  difficulty: ExerciseDifficulty;
  media_url: string | null;
  instructions: string | null;
  tips: string | null;
  target_sets: number | null;
  target_reps: number | null;
  target_weight: number | null;
  day_of_week: DayOfWeek;
  log_count: number;
  last_logged_at: string | null;
}

export interface WorkoutPlan {
  id: string;
  goal: PlanGoal | null;
  status: 'pending' | 'active' | 'adjusted';
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  details: PlanDetail[];
}

/** แปลงรายการในแผนให้เป็น Exercise (ใช้เปิด ExerciseDetailDialog / ExerciseCard) */
export function detailToExercise(d: PlanDetail): Exercise {
  return {
    id: d.exercise_id,
    name: d.exercise_name,
    category: d.category,
    muscle_group: d.muscle_group,
    equipment: d.equipment,
    difficulty: d.difficulty,
    media_url: d.media_url,
    instructions: d.instructions,
    tips: d.tips,
  };
}

/** จัดกลุ่มตามวัน เรียงจันทร์→อาทิตย์ (เฉพาะวันที่มีท่า) */
export function groupByDay(details: PlanDetail[]): Array<{ day: DayOfWeek; items: PlanDetail[] }> {
  return DAY_ORDER.map((day) => ({ day, items: details.filter((d) => d.day_of_week === day) })).filter(
    (g) => g.items.length > 0,
  );
}

/** วันนี้เป็นวันอะไร (ชื่อภาษาอังกฤษตามที่ backend ใช้) */
export function todayDay(): DayOfWeek {
  const idx = new Date().getDay(); // 0 = Sunday
  return DAY_ORDER[(idx + 6) % 7];
}

/** GET /api/workout-plans/current — null ถ้ายังไม่มีแผน (404) */
export async function getCurrentWorkoutPlan(): Promise<WorkoutPlan | null> {
  try {
    return await apiFetch<WorkoutPlan>('/api/workout-plans/current');
  } catch (err) {
    if (err && typeof err === 'object' && 'status' in err && (err as { status: number }).status === 404) return null;
    throw err;
  }
}

/** POST /api/workout-plans/generate */
export function generateWorkoutPlan(goal: PlanGoal): Promise<WorkoutPlan> {
  return apiFetch<WorkoutPlan>('/api/workout-plans/generate', { method: 'POST', body: JSON.stringify({ goal }) });
}

/** POST /api/workout-plans/:planId/log */
export function logWorkout(
  planId: string,
  data: { exerciseId: string; sets: number; reps: number; weightKg?: number },
): Promise<{ id: string }> {
  return apiFetch<{ id: string }>(`/api/workout-plans/${planId}/log`, { method: 'POST', body: JSON.stringify(data) });
}
