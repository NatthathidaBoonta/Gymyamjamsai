/**
 * user.service.ts — API calls สำหรับ Admin จัดการผู้ใช้งาน (/api/users/admin)
 */

import { apiFetch } from './api';

export type UserRole = 'admin' | 'trainer' | 'member';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  is_active: number | boolean;
  created_at: string;
  first_name: string | null;
  last_name: string | null;
}

export interface CreateUserInput {
  email: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserInput {
  role: UserRole;
  is_active: 0 | 1;
}

export const userService = {
  getAllUsers: (): Promise<User[]> => apiFetch<User[]>('/api/users/admin'),

  createUser: (data: CreateUserInput): Promise<Pick<User, 'id' | 'email' | 'role'>> =>
    apiFetch('/api/users/admin', { method: 'POST', body: JSON.stringify(data) }),

  updateUser: (id: string, data: UpdateUserInput): Promise<{ success: boolean }> =>
    apiFetch(`/api/users/admin/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};
