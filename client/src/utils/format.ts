import type { Task } from '../types';

const MIN = 60_000;
const HOUR = 3_600_000;
const DAY = 86_400_000;
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'} ago`;

export function formatDate(iso?: string | null, withYear = false) {
  if (!iso) return 'No due date';
  const d = new Date(iso);
  const showYear = withYear || d.getFullYear() !== new Date().getFullYear();
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', ...(showYear ? { year: 'numeric' } : {}) });
}

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < MIN) return 'just now';
  if (diff < HOUR) return plural(Math.floor(diff / MIN), 'minute');
  if (diff < DAY) return plural(Math.floor(diff / HOUR), 'hour');
  return plural(Math.floor(diff / DAY), 'day');
}

export const isOverdue = (t: Pick<Task, 'dueDate' | 'status'>) =>
  !!t.dueDate && t.status !== 'Completed' && new Date(t.dueDate).getTime() < Date.now();

/** <input type="date"> <-> ISO. Due dates are stored as the end of the chosen local day. */
export function toInputDate(iso?: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
export function fromInputDate(value: string) {
  if (!value) return null;
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d, 23, 59, 59).toISOString();
}

export const formatBytes = (n = 0) => (n > 1_000_000 ? `${(n / 1_000_000).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1000))} KB`);
