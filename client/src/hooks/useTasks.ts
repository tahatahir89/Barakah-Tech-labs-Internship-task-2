import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { toApiError } from '../services/api';
import { taskService } from '../services/taskService';
import type { Task, TaskFilters, TaskInput, TaskStatus } from '../types';

export const useTasks = (filters: TaskFilters) =>
  useQuery({ queryKey: ['tasks', 'list', filters], queryFn: () => taskService.list(filters), placeholderData: keepPreviousData });

export const useTask = (id?: string) =>
  useQuery({ queryKey: ['tasks', 'detail', id], queryFn: () => taskService.get(id as string), enabled: !!id });

export const useCategories = () => useQuery({ queryKey: ['tasks', 'categories'], queryFn: taskService.categories });

export const useDashboardStats = () => useQuery({ queryKey: ['dashboard'], queryFn: taskService.stats });

const fail = (fallback: string) => (err: unknown) => {
  const { status, message } = toApiError(err);
  toast.error(status >= 500 || status === 0 ? fallback : message);
};

export function useTaskMutations() {
  const qc = useQueryClient();
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['tasks'] });
    qc.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const create = useMutation({
    mutationFn: (data: TaskInput) => taskService.create(data),
    onSuccess: () => toast.success('Task created successfully'),
    onError: fail('Unable to create task. Please try again.'),
    onSettled: refresh,
  });

  const update = useMutation({
    mutationFn: ({ id, data, silent }: { id: string; data: Parameters<typeof taskService.update>[1]; silent?: boolean }) =>
      taskService.update(id, data).then((task) => ({ task, silent })),
    onSuccess: ({ silent }) => {
      if (!silent) toast.success('Task updated successfully');
    },
    onError: fail('Unable to update task. Please try again.'),
    onSettled: refresh,
  });

  // Optimistic: the card flips instantly and rolls back if the server rejects it.
  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) => taskService.update(id, { status }),
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: ['tasks', 'list'] });
      const snapshots = qc.getQueriesData<Task[]>({ queryKey: ['tasks', 'list'] });
      qc.setQueriesData<Task[]>({ queryKey: ['tasks', 'list'] }, (old) => old?.map((t) => (t.id === id ? { ...t, status } : t)));
      return { snapshots };
    },
    onError: (err, _vars, ctx) => {
      ctx?.snapshots.forEach(([key, data]) => qc.setQueryData(key, data));
      fail('Unable to update task. Please try again.')(err);
    },
    onSuccess: (_task, { status }) => toast.success(status === 'Completed' ? 'Task marked as complete' : 'Task updated successfully'),
    onSettled: refresh,
  });

  const remove = useMutation({
    mutationFn: (id: string) => taskService.remove(id),
    onSuccess: () => toast.success('Task deleted successfully'),
    onError: fail('Unable to delete task. Please try again.'),
    onSettled: refresh,
  });

  const upload = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => taskService.upload(id, file),
    onSuccess: () => toast.success('Image uploaded successfully'),
    onError: fail('Image upload failed. Please try again.'),
    onSettled: refresh,
  });

  const removeAttachment = useMutation({
    mutationFn: ({ id, attachmentId }: { id: string; attachmentId: string }) => taskService.removeAttachment(id, attachmentId),
    onSuccess: () => toast.success('Image removed'),
    onError: fail('Unable to remove image. Please try again.'),
    onSettled: refresh,
  });

  return { create, update, setStatus, remove, upload, removeAttachment };
}
