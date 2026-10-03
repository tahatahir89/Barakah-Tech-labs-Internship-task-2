export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type TaskStatus = 'Todo' | 'In Progress' | 'Completed';
export const PRIORITIES: Priority[] = ['Low', 'Medium', 'High', 'Urgent'];
export const STATUSES: TaskStatus[] = ['Todo', 'In Progress', 'Completed'];
export const STATUS_LABEL: Record<TaskStatus, string> = { Todo: 'To do', 'In Progress': 'In progress', Completed: 'Completed' };

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  profileImage: string | null;
  status: 'active' | 'offline';
  lastActive: string;
  createdAt: string;
}
export interface UserStats { total: number; completed: number; pending: number }

export interface Attachment { id: string; url: string; name?: string; bytes?: number }

export interface Stroke {
  tool: 'pencil' | 'pen' | 'eraser';
  color: string;
  size: number;
  points: [number, number][];
}
export interface Drawing { width: number; height: number; strokes: Stroke[] }

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  category: string;
  dueDate: string | null;
  completedAt: string | null;
  attachments: Attachment[];
  drawing: Drawing | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskInput {
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  category: string;
  dueDate: string | null;
}

export type DueFilter = '' | 'today' | 'week' | 'overdue' | 'none';
export type SortKey = 'newest' | 'oldest' | 'due' | 'priority';
export interface TaskFilters {
  q: string;
  status: '' | TaskStatus;
  priority: '' | Priority;
  category: string;
  due: DueFilter;
  sort: SortKey;
}

export interface DashboardStats {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  highPriority: number;
  overdue: number;
  byPriority: Partial<Record<Priority, number>>;
  activity: { date: string; count: number }[];
}
