import apiClient from '@/lib/api-client';
import type { User, UserRole } from '@/features/auth/types';

export interface ManagedUserInput {
  username: string;
  email: string;
  password: string;
  role: UserRole;
}

export const usersApi = {
  list: async (): Promise<User[]> => (await apiClient.get<User[]>('/users')).data,
  create: async (input: ManagedUserInput): Promise<User> =>
    (await apiClient.post<User>('/users', input)).data,
  updateRole: async (id: string, role: UserRole): Promise<User> =>
    (await apiClient.patch<User>(`/users/${id}/role`, { role })).data,
};
