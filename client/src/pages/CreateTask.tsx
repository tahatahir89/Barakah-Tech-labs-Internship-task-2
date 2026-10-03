import { ArrowLeft, Download } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { TaskForm } from '../components/TaskForm';
import { Button } from '../components/ui/Button';
import { useTaskMutations } from '../hooks/useTasks';
import { downloadTaskTemplate } from '../utils/template';

export default function CreateTask() {
  const navigate = useNavigate();
  const { create } = useTaskMutations();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link to="/tasks" className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to tasks</Link>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">Create task</h1>
          <p className="mt-1 text-sm text-zinc-400">You can add images and a sketch once it's saved.</p>
        </div>
        <Button variant="outline" icon={<Download className="h-4 w-4" />} onClick={() => void downloadTaskTemplate()}>Download template</Button>
      </div>
      <div className="glass p-5 sm:p-7">
        <TaskForm
          submitLabel="Create task"
          submitting={create.isPending}
          onCancel={() => navigate(-1)}
          onSubmit={(data) => create.mutate(data, { onSuccess: (task) => navigate(`/tasks/${task.id}`) })}
        />
      </div>
    </div>
  );
}
