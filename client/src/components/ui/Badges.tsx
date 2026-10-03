import clsx from 'clsx';
import type { Priority, TaskStatus } from '../../types';
import { STATUS_LABEL } from '../../types';

const PRIORITY_STYLE: Record<Priority, string> = {
  Low: 'border-sky-400/30 bg-sky-400/10 text-sky-300',
  Medium: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
  High: 'border-neon-orange/40 bg-neon-orange/10 text-neon-orange',
  Urgent: 'border-neon-red/50 bg-neon-red/15 text-red-300',
};
const PRIORITY_DOT: Record<Priority, string> = {
  Low: 'bg-sky-400',
  Medium: 'bg-amber-400',
  High: 'bg-neon-orange',
  Urgent: 'bg-neon-red shadow-[0_0_8px_#ff2e3a]',
};
const STATUS_STYLE: Record<TaskStatus, string> = {
  Todo: 'border-white/15 bg-white/5 text-zinc-300',
  'In Progress': 'border-neon-orange/40 bg-neon-orange/10 text-neon-orange',
  Completed: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
};

const base = 'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium';

export const PriorityBadge = ({ priority }: { priority: Priority }) => (
  <span className={clsx(base, PRIORITY_STYLE[priority])}>
    <span className={clsx('h-1.5 w-1.5 rounded-full', PRIORITY_DOT[priority])} aria-hidden />
    {priority}
  </span>
);

export const StatusBadge = ({ status }: { status: TaskStatus }) => (
  <span className={clsx(base, STATUS_STYLE[status])}>{STATUS_LABEL[status]}</span>
);
