import { FormEvent, useState } from 'react';
import { useCategories, useTaskMutations } from '../hooks/useTasks';
import type { Priority, Task, TaskInput, TaskStatus } from '../types';
import { PRIORITIES, STATUSES, STATUS_LABEL } from '../types';
import { fromInputDate, toInputDate } from '../utils/format';
import { Button } from './ui/Button';
import { Input, Select, Textarea } from './ui/Fields';
import { Modal } from './ui/Modal';

interface Props {
  initial?: Task;
  submitting?: boolean;
  submitLabel?: string;
  onSubmit: (data: TaskInput) => void;
  onCancel?: () => void;
}

export function TaskForm({ initial, submitting, submitLabel = 'Save task', onSubmit, onCancel }: Props) {
  const { data: categories = [] } = useCategories();
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? 'Medium');
  const [status, setStatus] = useState<TaskStatus>(initial?.status ?? 'Todo');
  const [category, setCategory] = useState(initial?.category ?? 'General');
  const [dueDate, setDueDate] = useState(toInputDate(initial?.dueDate));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!title.trim()) next.title = 'Give your task a title';
    else if (title.length > 120) next.title = 'Keep the title under 120 characters';
    if (description.length > 2000) next.description = 'Keep the description under 2000 characters';
    if (!category.trim()) next.category = 'Add a category';
    else if (category.length > 40) next.category = 'Keep the category under 40 characters';
    setErrors(next);
    if (Object.keys(next).length) return;
    onSubmit({ title: title.trim(), description: description.trim(), priority, status, category: category.trim(), dueDate: fromInputDate(dueDate) });
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} error={errors.title} placeholder="e.g. Design the landing page" maxLength={130} autoFocus />
      <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} error={errors.description} placeholder="Add details, links or acceptance criteria" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Priority" value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
          {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
        </Select>
        <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)}>
          {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </Select>
        <div>
          <Input label="Category" list="task-categories" value={category} onChange={(e) => setCategory(e.target.value)} error={errors.category} />
          <datalist id="task-categories">{categories.map((c) => <option key={c} value={c} />)}</datalist>
        </div>
        <Input label="Due date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        {onCancel && <Button variant="ghost" onClick={onCancel} disabled={submitting}>Cancel</Button>}
        <Button type="submit" loading={submitting}>{submitLabel}</Button>
      </div>
    </form>
  );
}

export function TaskFormModal({ task, open, onClose }: { task: Task; open: boolean; onClose: () => void }) {
  const { update } = useTaskMutations();
  return (
    <Modal open={open} onClose={onClose} title="Edit task">
      <TaskForm
        initial={task}
        submitting={update.isPending}
        submitLabel="Save changes"
        onCancel={onClose}
        onSubmit={(data) => update.mutate({ id: task.id, data }, { onSuccess: onClose })}
      />
    </Modal>
  );
}
