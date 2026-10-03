import { motion } from 'framer-motion';
import { CalendarDays, Check, Paperclip, Pencil, RotateCcw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTaskMutations } from '../hooks/useTasks';
import type { Task } from '../types';
import { formatDate, isOverdue } from '../utils/format';
import { TaskFormModal } from './TaskForm';
import { PriorityBadge, StatusBadge } from './ui/Badges';
import { ConfirmDialog } from './ui/Modal';

export function TaskCard({ task, index = 0 }: { task: Task; index?: number }) {
  const { setStatus, remove } = useTaskMutations();
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const done = task.status === 'Completed';
  const overdue = isOverdue(task);

  const action = 'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors';

  return (
    <>
      <motion.article
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(index, 8) * 0.03, duration: 0.25 }}
        whileHover={{ y: -3 }}
        className="glass glow-hover flex flex-col p-5"
      >
        <div className="flex items-center justify-between gap-2">
          <PriorityBadge priority={task.priority} />
          <StatusBadge status={task.status} />
        </div>

        <Link to={`/tasks/${task.id}`} className="mt-4 block rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-orange/60">
          <h3 className={`font-display text-base font-semibold leading-snug ${done ? 'text-zinc-500 line-through' : 'text-white'}`}>{task.title}</h3>
        </Link>
        {task.description && <p className="mt-1.5 line-clamp-2 text-sm text-zinc-400">{task.description}</p>}

        <div className="mb-4 mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
          <span className={`inline-flex items-center gap-1.5 ${overdue ? 'font-medium text-neon-red' : ''}`}>
            <CalendarDays className="h-3.5 w-3.5" />
            {task.dueDate ? formatDate(task.dueDate) : 'No due date'}
            {overdue && ' (overdue)'}
          </span>
          <span>{task.category}</span>
          {task.attachments.length > 0 && (
            <span className="inline-flex items-center gap-1"><Paperclip className="h-3.5 w-3.5" />{task.attachments.length}</span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-end gap-1 border-t border-white/[0.06] pt-3">
          <button onClick={() => setEditing(true)} className={`${action} text-zinc-300 hover:bg-white/[0.07]`}>
            <Pencil className="h-3.5 w-3.5" /> Edit
          </button>
          <button
            onClick={() => setStatus.mutate({ id: task.id, status: done ? 'Todo' : 'Completed' })}
            className={`${action} ${done ? 'text-zinc-300 hover:bg-white/[0.07]' : 'text-emerald-300 hover:bg-emerald-400/10'}`}
          >
            {done ? <RotateCcw className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
            {done ? 'Reopen' : 'Complete'}
          </button>
          <button onClick={() => setConfirming(true)} className={`${action} text-red-300 hover:bg-red-500/10`}>
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
        </div>
      </motion.article>

      <TaskFormModal task={task} open={editing} onClose={() => setEditing(false)} />
      <ConfirmDialog
        open={confirming}
        title="Delete this task?"
        message={`"${task.title}" and its images and drawing will be permanently deleted.`}
        loading={remove.isPending}
        onClose={() => setConfirming(false)}
        onConfirm={() => remove.mutate(task.id, { onSuccess: () => setConfirming(false) })}
      />
    </>
  );
}
