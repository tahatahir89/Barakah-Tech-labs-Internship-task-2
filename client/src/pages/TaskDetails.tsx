import { ArrowLeft, Check, Pencil, RotateCcw, Trash2 } from 'lucide-react';
import { ReactNode, useState } from 'react';
import { toast } from 'sonner';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { DrawingCanvas } from '../components/DrawingCanvas';
import { ImageUploader } from '../components/ImageUploader';
import { TaskFormModal } from '../components/TaskForm';
import { UserAvatar } from '../components/ui/Avatar';
import { PriorityBadge, StatusBadge } from '../components/ui/Badges';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/Modal';
import { ErrorState, LoadingSpinner } from '../components/ui/States';
import { useAuth } from '../context/AuthContext';
import { useTask, useTaskMutations } from '../hooks/useTasks';
import { toApiError } from '../services/api';
import { STATUSES, STATUS_LABEL } from '../types';
import type { TaskStatus } from '../types';
import { formatDate, formatDateTime, isOverdue } from '../utils/format';

function Meta({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-zinc-500">{label}</dt>
      <dd className="mt-1 text-sm text-zinc-200">{children}</dd>
    </div>
  );
}

export default function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: task, isLoading, isError, error, refetch } = useTask(id);
  const { update, setStatus, remove, upload, removeAttachment } = useTaskMutations();
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);

  if (isLoading) return <div className="flex justify-center py-24"><LoadingSpinner className="h-8 w-8" /></div>;
  if (isError || !task) {
    return (
      <div className="space-y-4">
        <Link to="/tasks" className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to tasks</Link>
        <ErrorState message={toApiError(error).message} onRetry={() => refetch()} />
      </div>
    );
  }

  const done = task.status === 'Completed';
  const overdue = isOverdue(task);

  return (
    <div className="space-y-6">
      <Link to="/tasks" className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to tasks</Link>

      <section className="glass p-5 sm:p-7">
        <div className="flex flex-wrap items-center gap-2">
          <PriorityBadge priority={task.priority} />
          <StatusBadge status={task.status} />
          {overdue && <span className="rounded-full border border-neon-red/40 bg-neon-red/10 px-2.5 py-0.5 text-xs font-medium text-red-300">Overdue</span>}
        </div>
        <h1 className={`mt-4 font-display text-2xl font-bold sm:text-3xl ${done ? 'text-zinc-500 line-through' : 'text-white'}`}>{task.title}</h1>
        <p className="mt-3 max-w-3xl whitespace-pre-wrap text-sm leading-relaxed text-zinc-400">{task.description || 'No description added.'}</p>

        <dl className="mt-7 grid grid-cols-2 gap-5 border-t border-white/[0.06] pt-6 sm:grid-cols-3 lg:grid-cols-5">
          <Meta label="Category">{task.category}</Meta>
          <Meta label="Due date"><span className={overdue ? 'text-neon-red' : ''}>{task.dueDate ? formatDate(task.dueDate, true) : 'None'}</span></Meta>
          <Meta label="Created">{formatDateTime(task.createdAt)}</Meta>
          <Meta label="Updated">{formatDateTime(task.updatedAt)}</Meta>
          <Meta label="Owner">
            {user && <span className="flex items-center gap-2"><UserAvatar user={user} size={22} /><span className="truncate">{user.name}</span></span>}
          </Meta>
        </dl>

        <div className="mt-7 flex flex-wrap items-center gap-2">
          <Button icon={done ? <RotateCcw className="h-4 w-4" /> : <Check className="h-4 w-4" />} variant={done ? 'outline' : 'primary'} onClick={() => setStatus.mutate({ id: task.id, status: done ? 'Todo' : 'Completed' })}>
            {done ? 'Reopen' : 'Mark complete'}
          </Button>
          <Button variant="outline" icon={<Pencil className="h-4 w-4" />} onClick={() => setEditing(true)}>Edit</Button>
          <select
            aria-label="Change status"
            value={task.status}
            onChange={(e) => setStatus.mutate({ id: task.id, status: e.target.value as TaskStatus })}
            className="input w-auto py-2.5 [&>option]:bg-zinc-900"
          >
            {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
          <Button variant="danger" className="ml-auto" icon={<Trash2 className="h-4 w-4" />} onClick={() => setConfirming(true)}>Delete</Button>
        </div>
      </section>

      <section className="glass p-5 sm:p-7" aria-labelledby="att-title">
        <h2 id="att-title" className="mb-4 font-display text-lg font-semibold text-white">Images</h2>
        <ImageUploader
          attachments={task.attachments}
          onUpload={(file) => upload.mutateAsync({ id: task.id, file })}
          onRemove={(attachmentId) => removeAttachment.mutate({ id: task.id, attachmentId })}
        />
      </section>

      <section className="glass p-5 sm:p-7" aria-labelledby="draw-title">
        <h2 id="draw-title" className="font-display text-lg font-semibold text-white">Sketch pad</h2>
        <p className="mb-4 mt-1 text-sm text-zinc-500">Quick diagrams and notes that stay with this task.</p>
        <DrawingCanvas
          initial={task.drawing}
          saving={update.isPending}
          onSave={(drawing) => update.mutate({ id: task.id, data: { drawing }, silent: true }, { onSuccess: () => toast.success('Drawing saved') })}
        />
      </section>

      <TaskFormModal task={task} open={editing} onClose={() => setEditing(false)} />
      <ConfirmDialog
        open={confirming}
        title="Delete this task?"
        message="This permanently deletes the task, its images and its drawing."
        loading={remove.isPending}
        onClose={() => setConfirming(false)}
        onConfirm={() => remove.mutate(task.id, { onSuccess: () => navigate('/tasks', { replace: true }) })}
      />
    </div>
  );
}
