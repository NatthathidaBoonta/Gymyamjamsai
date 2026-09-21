/**
 * exerciseSplit.ts — จัดท่าเข้า "สาย" (Push / Pull / Legs & Core)
 *
 * ที่มา: แท็กในคลังท่าของโปรเจกต์เดิม (02-seed.sql) เช่น "[Push (Chest, Shoulders, Triceps)]"
 * ยกมาทั้งสายและกลุ่มกล้ามเนื้อภาษาอังกฤษแบบเดิมทุกท่า — ท่าใหม่ที่ไม่อยู่ในตารางค่อยเดาจากกล้ามเนื้อหลัก
 */

import type { Exercise } from '../services/exercise.service';

export type Split = 'push' | 'pull' | 'legs';

export interface SplitMeta {
  key: Split;
  tab: string;
  tabSub: string;
  title: string;
  desc: string;
}

export const SPLITS: SplitMeta[] = [
  { key: 'push', tab: 'Chest & Shoulders', tabSub: 'Bench • Overhead Press • Flyes', title: 'Push Exercises', desc: 'Exercises targeting chest, shoulders, and triceps' },
  { key: 'pull', tab: 'Back & Arms', tabSub: 'Rows • Pull-ups • Curls', title: 'Pull Exercises', desc: 'Exercises targeting back, biceps, and forearms' },
  { key: 'legs', tab: 'Legs & Core', tabSub: 'Squats • Deadlift • Core', title: 'Legs & Core Exercises', desc: 'Exercises targeting quads, hamstrings, glutes, and core' },
];

/** สาย + กล้ามเนื้อ (อังกฤษ) ตามโปรเจกต์เดิม เรียงตาม id */
const ORIGINAL: Record<string, { split: Split; muscles: string[] }> = {
  ex001: { split: 'push', muscles: ['Shoulders', 'Triceps'] },            // Arnold Press
  ex002: { split: 'pull', muscles: ['Biceps'] },                          // Barbell Curl
  ex003: { split: 'push', muscles: ['Chest', 'Shoulders', 'Triceps'] },   // Bench Press
  ex004: { split: 'legs', muscles: ['Quads', 'Glutes'] },                 // Bulgarian Split Squat
  ex005: { split: 'legs', muscles: ['Calves'] },                          // Calf Raise
  ex006: { split: 'push', muscles: ['Chest'] },                           // Chest Fly
  ex007: { split: 'pull', muscles: ['Biceps', 'Back'] },                  // Chin-Up
  ex008: { split: 'legs', muscles: ['Hamstrings', 'Glutes', 'Back'] },    // Deadlift (เดิมจัดอยู่สาย Legs)
  ex009: { split: 'push', muscles: ['Triceps', 'Chest'] },                // Diamond Push-Up
  ex010: { split: 'push', muscles: ['Chest', 'Triceps'] },                // Dips
  ex011: { split: 'legs', muscles: ['Core'] },                            // Dragon Flag
  ex012: { split: 'pull', muscles: ['Back', 'Biceps'] },                  // Dumbbell Row
  ex013: { split: 'pull', muscles: ['Biceps'] },                          // Hammer Curl
  ex014: { split: 'push', muscles: ['Chest', 'Shoulders', 'Triceps'] },   // Incline Dumbbell Bench Press
  ex015: { split: 'pull', muscles: ['Back', 'Biceps'] },                  // Lat Pulldown
  ex016: { split: 'push', muscles: ['Shoulders'] },                       // Lateral Raise
  ex017: { split: 'legs', muscles: ['Hamstrings'] },                      // Leg Curl
  ex018: { split: 'legs', muscles: ['Core'] },                            // Leg Raise
  ex019: { split: 'legs', muscles: ['Quads', 'Glutes'] },                 // Lunges
  ex020: { split: 'pull', muscles: ['Back', 'Triceps', 'Chest'] },        // Muscle Up (เดิม Pull/Push)
  ex021: { split: 'legs', muscles: ['Hamstrings'] },                      // Nordic Hamstring Curl
  ex022: { split: 'pull', muscles: ['Back', 'Biceps'] },                  // One Arm Pull-Up
  ex023: { split: 'legs', muscles: ['Core'] },                            // Plank
  ex024: { split: 'pull', muscles: ['Back', 'Biceps'] },                  // Pull-ups
  ex025: { split: 'push', muscles: ['Chest', 'Shoulders', 'Triceps'] },   // Push-up
  ex026: { split: 'pull', muscles: ['Rear Delts'] },                      // Rear Delt Machine Fly
  ex027: { split: 'pull', muscles: ['Forearms', 'Biceps'] },              // Reverse Barbell Curl
  ex028: { split: 'legs', muscles: ['Core', 'Obliques'] },                // Russian Twist
  ex029: { split: 'pull', muscles: ['Back'] },                            // Seated Cable Row
  ex030: { split: 'push', muscles: ['Shoulders'] },                       // Shoulder Press
  ex031: { split: 'legs', muscles: ['Quads'] },                           // Shrimp Squat
  ex032: { split: 'push', muscles: ['Triceps'] },                         // Skullcrusher
  ex033: { split: 'legs', muscles: ['Quads', 'Glutes'] },                 // Squat
  ex034: { split: 'legs', muscles: ['Hamstrings', 'Glutes'] },            // Sumo Deadlift
  ex035: { split: 'legs', muscles: ['Core'] },                            // Toes to Bar
  ex036: { split: 'push', muscles: ['Triceps', 'Chest'] },                // Triceps Dips
  ex037: { split: 'push', muscles: ['Triceps'] },                         // Triceps Pushdown
  ex038: { split: 'pull', muscles: ['Forearms'] },                        // Wrist Curl
  ex039: { split: 'legs', muscles: ['Full Body'] },                       // Jumping Jack
};

export function splitOf(e: Exercise): Split {
  const known = ORIGINAL[e.id];
  if (known) return known.split;
  // ท่าใหม่: เดาจากกล้ามเนื้อหลัก — ตัดคำที่มี "หลัง" แต่ไม่ใช่กล้ามหลังออกก่อน
  const m = (e.muscle_group || '').replace(/ต้นขาหลัง|หลังแขน|ไหล่หลัง/g, '');
  if (/อก|ไหล่|chest|shoulder|tricep/i.test(m) || /หลังแขน/.test(e.muscle_group || '')) return 'push';
  if (/หลัง|ต้นแขนด้านหน้า|ปลายแขน|back|bicep|forearm|lat/i.test(m)) return 'pull';
  return 'legs';
}

/** ชิปกล้ามเนื้อ — อังกฤษตามโปรเจกต์เดิม; ท่าใหม่ใช้ข้อความในช่องกล้ามเนื้อหลัก */
export function muscleChips(e: Exercise): string[] {
  const known = ORIGINAL[e.id];
  if (known) return known.muscles;
  return (e.muscle_group || '')
    .split(/[,،]\s*/)
    .map((s) => s.replace(/\s*\(.*?\)\s*/g, '').trim())
    .filter(Boolean)
    .slice(0, 3);
}
