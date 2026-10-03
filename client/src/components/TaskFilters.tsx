import { RotateCcw, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import type { DueFilter, Priority, SortKey, TaskFilters as Filters, TaskStatus } from '../types';
import { PRIORITIES, STATUSES, STATUS_LABEL } from '../types';
import { Button } from './ui/Button';

interface Props {
  filters: Filters;
  categories: string[];
  onChange: (patch: Partial<Filters>) => void;
  onReset: () => void;
  active: boolean;
}

const selectCls = 'input w-auto min-w-[8.5rem] py-2 [&>option]:bg-zinc-900';

export function TaskFilters({ filters, categories, onChange, onReset, active }: Props) {
  const [text, setText] = useState(filters.q);
  const debounced = useDebounce(text, 350);

  // Debounced search: only push to the URL (and the server) once the user pauses typing.
  useEffect(() => {
    if (debounced !== filters.q) onChange({ q: debounced });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  // Reflect external changes (reset button, sidebar links) without clobbering what is being typed.
  useEffect(() => {
    if (filters.q !== debounced) setText(filters.q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.q]);

  return (
    <div className="glass space-y-3 p-3 sm:p-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <input
          type="search"
          aria-label="Search tasks"
          placeholder="Search by title or description"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="input pl-10 pr-10"
        />
        {text && (
          <button aria-label="Clear search" onClick={() => setText('')} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-zinc-500 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <select aria-label="Status" className={selectCls} value={filters.status} onChange={(e) => onChange({ status: e.target.value as TaskStatus | '' })}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
        <select aria-label="Priority" className={selectCls} value={filters.priority} onChange={(e) => onChange({ priority: e.target.value as Priority | '' })}>
          <option value="">All priorities</option>
          {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
        </select>
        <select aria-label="Category" className={selectCls} value={filters.category} onChange={(e) => onChange({ category: e.target.value })}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select aria-label="Due date" className={selectCls} value={filters.due} onChange={(e) => onChange({ due: e.target.value as DueFilter })}>
          <option value="">Any due date</option>
          <option value="today">Due today</option>
          <option value="week">Due this week</option>
          <option value="overdue">Overdue</option>
          <option value="none">No due date</option>
        </select>
        <select aria-label="Sort" className={`${selectCls} sm:ml-auto`} value={filters.sort} onChange={(e) => onChange({ sort: e.target.value as SortKey })}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="due">Due date</option>
          <option value="priority">Priority</option>
        </select>
        {active && <Button variant="ghost" icon={<RotateCcw className="h-4 w-4" />} onClick={onReset}>Reset</Button>}
      </div>
    </div>
  );
}
