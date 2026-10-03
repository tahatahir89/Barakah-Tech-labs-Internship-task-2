import type { User, UserStats } from '../types';
import { api } from './api';

export interface RegisterInput {
  name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const authService = {
  me: async () => (await api.get<{ user: User }>('/auth/me')).data.user,
  login: async (body: { email: string; password: string }) => (await api.post<{ user: User }>('/auth/login', body)).data.user,
  register: async (body: RegisterInput) => (await api.post<{ user: User }>('/auth/register', body)).data.user,
  logout: async () => {
    await api.post('/auth/logout');
  },
};

const imageForm = (file: File) => {
  const form = new FormData();
  form.append('image', file);
  return form;
};

export const userService = {
  profile: async () => (await api.get<{ user: User; stats: UserStats }>('/users/me')).data,
  update: async (body: Partial<Pick<User, 'name' | 'username' | 'email'>>) => (await api.patch<{ user: User }>('/users/me', body)).data.user,
  changePassword: async (body: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    await api.patch('/users/me/password', body);
  },
  uploadAvatar: async (file: File) => (await api.post<{ user: User }>('/users/me/avatar', imageForm(file))).data.user,
  removeAvatar: async () => (await api.delete<{ user: User }>('/users/me/avatar')).data.user,
  heartbeat: async () => {
    await api.post('/users/me/heartbeat');
  },
};
