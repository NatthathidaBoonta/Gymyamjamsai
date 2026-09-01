import { apiFetch } from './api';

export interface UserProfileData {
  firstName: string;
  lastName: string;
  fitnessGoal: string;
  medicalConditions: string;
  weight: string;
  height: string;
}

export async function getProfile() {
  return await apiFetch<any>('/api/users/profile');
}

export async function updateProfile(data: UserProfileData) {
  return await apiFetch<any>('/api/users/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
