/**
 * src/services/profile.ts
 *
 * Profile API Service
 * เรียกใช้ /api/profile Endpoints
 */

import api from './api';

// ============================================================
// Types
// ============================================================
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';
export type Gender = 'male' | 'female' | 'other';

export interface Profile {
  weightKg: number | null;
  heightCm: number | null;
  age: number | null;
  gender: Gender | null;
  goal: string | null;
  fitnessLevel: FitnessLevel | null;
  updatedAt?: string;
}

export interface ProfileResponse {
  success: boolean;
  data: Profile | null;
}

export interface SaveProfilePayload {
  weightKg: number;
  heightCm: number;
  age: number;
  gender: Gender;
  goal: string;
  fitnessLevel: FitnessLevel;
}

// ============================================================
// API Calls
// ============================================================

/**
 * ดึง Profile ของผู้ใช้ปัจจุบัน (null ถ้ายังไม่เคยกรอก)
 */
export const getMyProfile = async (): Promise<ProfileResponse> => {
  const response = await api.get<ProfileResponse>('/api/profile/me');
  return response.data;
};

/**
 * บันทึก (สร้าง/แก้ไข) Profile ของผู้ใช้ปัจจุบัน
 */
export const saveMyProfile = async (payload: SaveProfilePayload): Promise<ProfileResponse> => {
  const response = await api.put<ProfileResponse>('/api/profile/me', payload);
  return response.data;
};
