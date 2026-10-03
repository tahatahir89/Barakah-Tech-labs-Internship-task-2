import { CheckCircle2, ClipboardList, Clock, Download, Plus, SearchX } from 'lucide-react';
import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { TaskCard } from '../components/TaskCard';
import { TaskFilters } from '../components/TaskFilters';
import { Button } from '../components/ui/Button';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/States';
import { useCategories, useTasks } from '../hooks/useTasks';
import { toApiError } from '../services/api';
import type { DueFilter, SortKey, TaskFilters as Filters } from '../types';
import { PRIORITIES, STATUSES } from '../types';
import { downloadTaskTemplate } from '../utils/template';

const pick = <T extends string>(value: string | null, allowed: readonly T[], fallback: T) => (allowed.includes(value as T) ? (value as T) : fallback);

export default function Tasks() {
  const [params, setParams] = useSearchParams();
  const filters: Filters = useMemo(
    () => ({
      q: params.get('q') ?? '',
      status: pick(params.get('status'), STATUSES, '' as Filters['status']),
      priority: pick(params.get('priority'), PRIORITIES, '' as Filters['priority']),
      category: params.get('category') ?? '',
      due: pick<DueFilter>(params.get('due'), ['today', 'week', 'overdue', 'none'], ''),
      sort: pick<SortKey>(params.get('sort'), ['newest', 'oldest', 'due', 'priority'], 'newest'),
    }),
    [params],
  );

  // Filters live in the URL, so the sidebar's Completed/Pending links and browser back/forward just work.
  const onChange = (patch: Partial<Filters>) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([key, value]) => (value ? next.set(key, String(value)) : next.delete(key)));
    setParams(next, { replace: true });
  };

  const { data: tasks, isLoading, isError, error, refetch, isFetching } = useTasks(filters);
  const { data: categories = [] } = useCategories();
  const searching = !!(filters.q || filters.priority || filters.category || filters.due);
  const active = searching || !!filters.status || filters.sort !== 'newest';
  const title = filters.status === 'Completed' ? 'Completed' : filters.status === 'Todo' ? 'Pending' : 'My tasks';

  const empty = () => {
    if (searching || (filters.status === 'In Progress')) {
      return <EmptyState icon={<SearchX className="h-6 w-6" />} title="No matching tasks" description="Try a different search or clear some filters." action={<Button variant="outline" onClick={() => setParams({}, { replace: true })}>Clear filters</Button>} />;
    }
    if (filters.status === 'Completed') return <EmptyState icon={<CheckCircle2 className="h-6 w-6" />} title="Nothing completed yet" description="Finished tasks will show up here." />;
    if (filters.status === 'Todo') return <EmptyState icon={<Clock className="h-6 w-6" />} title="No pending tasks" description="You're all caught up. Add something new when you're ready." action={<Link to="/tasks/create" className="btn-primary"><Plus className="h-4 w-4" /> Create task</Link>} />;
    return <EmptyState icon={<ClipboardList className="h-6 w-6" />} title="No tasks yet" description="Start organizing your work by creating your first task." action={<Link to="/tasks/create" className="btn-primary"><Plus className="h-4 w-4" /> Create task</Link>} />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">{title}</h1>
          {tasks && <p className="mt-1 text-sm text-zinc-500">{tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}{isFetching ? ' - updating...' : ''}</p>}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" icon={<Download className="h-4 w-4" />} onClick={() => void downloadTaskTemplate()}>Download template</Button>
          <Link to="/tasks/create" className="btn-primary"><Plus className="h-4 w-4" /> New task</Link>
        </div>
      </div>

      <TaskFilters filters={filters} categories={categories} onChange={onChange} onReset={() => setParams({}, { replace: true })} active={active} />

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState message={toApiError(error).message} onRetry={() => refetch()} />
      ) : tasks && tasks.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{tasks.map((t, i) => <TaskCard key={t.id} task={t} index={i} />)}</div>
      ) : (
        empty()
      )}
    </div>
  );
}
