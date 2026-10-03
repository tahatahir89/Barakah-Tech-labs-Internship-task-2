import type { DashboardStats, Task, TaskFilters, TaskInput } from '../types';
import { api } from './api';

const DAY = 86_400_000;

/** Maps UI filters to server query params (date ranges are computed in the user's timezone). */
export function toParams(f: TaskFilters) {
  const p: Record<string, string> = { sort: f.sort, limit: '100' };
  if (f.q) p.q = f.q;
  if (f.status) p.status = f.status;
  if (f.priority) p.priority = f.priority;
  if (f.category) p.category = f.category;
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  if (f.due === 'today' || f.due === 'week') {
    const days = f.due === 'today' ? 1 : 7;
    p.dueFrom = new Date(startOfToday).toISOString();
    p.dueTo = new Date(startOfToday + days * DAY - 1).toISOString();
  }
  if (f.due === 'overdue') p.overdue = '1';
  if (f.due === 'none') p.noDue = '1';
  return p;
}

const imageForm = (file: File) => {
  const form = new FormData();
  form.append('image', file);
  return form;
};

export const taskService = {
  list: async (filters: TaskFilters) => (await api.get<{ tasks: Task[] }>('/tasks', { params: toParams(filters) })).data.tasks,
  categories: async () => (await api.get<{ categories: string[] }>('/tasks/categories')).data.categories,
  get: async (id: string) => (await api.get<{ task: Task }>(`/tasks/${id}`)).data.task,
  create: async (body: TaskInput) => (await api.post<{ task: Task }>('/tasks', body)).data.task,
  update: async (id: string, body: Partial<TaskInput> & { drawing?: Task['drawing'] }) =>
    (await api.patch<{ task: Task }>(`/tasks/${id}`, body)).data.task,
  remove: async (id: string) => {
    await api.delete(`/tasks/${id}`);
  },
  upload: async (id: string, file: File) => (await api.post<{ task: Task }>(`/tasks/${id}/attachments`, imageForm(file))).data.task,
  removeAttachment: async (id: string, attachmentId: string) =>
    (await api.delete<{ task: Task }>(`/tasks/${id}/attachments/${attachmentId}`)).data.task,
  stats: async () => (await api.get<DashboardStats>('/dashboard/stats')).data,
};
