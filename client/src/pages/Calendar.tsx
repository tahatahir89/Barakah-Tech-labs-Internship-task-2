import clsx from 'clsx';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PriorityBadge } from '../components/ui/Badges';
import { Button } from '../components/ui/Button';
import { ErrorState, LoadingSpinner } from '../components/ui/States';
import { useTasks } from '../hooks/useTasks';
import { toApiError } from '../services/api';
import type { Priority, Task, TaskFilters } from '../types';
import { formatDate, toInputDate } from '../utils/format';

const ALL: TaskFilters = { q: '', status: '', priority: '', category: '', due: '', sort: 'due' };
const DOT: Record<Priority, string> = { Low: 'bg-sky-400', Medium: 'bg-amber-400', High: 'bg-neon-orange', Urgent: 'bg-neon-red' };
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const keyOf = (d: Date) => toInputDate(d.toISOString());

export default function Calendar() {
  const { data: tasks = [], isLoading, isError, error, refetch } = useTasks(ALL);
  const [cursor, setCursor] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selected, setSelected] = useState(() => keyOf(new Date()));

  const byDay = useMemo(() => {
    const map = new Map<string, Task[]>();
    tasks.forEach((t) => {
      if (!t.dueDate) return;
      const key = toInputDate(t.dueDate);
      map.set(key, [...(map.get(key) ?? []), t]);
    });
    return map;
  }, [tasks]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const offset = cursor.getDay();
  const total = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: Math.ceil((offset + total) / 7) * 7 }, (_, i) => {
    const day = i - offset + 1;
    return day >= 1 && day <= total ? new Date(year, month, day) : null;
  });
  const todayKey = keyOf(new Date());
  const selectedTasks = byDay.get(selected) ?? [];
  const shift = (n: number) => setCursor(new Date(year, month + n, 1));

  if (isError) return <ErrorState message={toApiError(error).message} onRetry={() => refetch()} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
          {cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h1>
        <div className="flex items-center gap-1">
          <Button variant="outline" aria-label="Previous month" icon={<ChevronLeft className="h-4 w-4" />} onClick={() => shift(-1)} />
          <Button variant="outline" onClick={() => { setCursor(new Date(new Date().getFullYear(), new Date().getMonth(), 1)); setSelected(todayKey); }}>Today</Button>
          <Button variant="outline" aria-label="Next month" icon={<ChevronRight className="h-4 w-4" />} onClick={() => shift(1)} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
        <section className="glass p-3 sm:p-4" aria-label="Month view">
          {isLoading && <div className="flex justify-center py-3"><LoadingSpinner /></div>}
          <div className="grid grid-cols-7 pb-2 text-center text-xs text-zinc-500">{WEEKDAYS.map((d) => <span key={d}>{d}</span>)}</div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((date, i) => {
              if (!date) return <div key={i} />;
              const key = keyOf(date);
              const list = byDay.get(key) ?? [];
              return (
                <button
                  key={key}
                  onClick={() => setSelected(key)}
                  aria-pressed={selected === key}
                  aria-label={`${date.toLocaleDateString('en-US', { dateStyle: 'full' })}, ${list.length} tasks`}
                  className={clsx(
                    'flex aspect-square flex-col items-center rounded-xl border p-1.5 text-sm transition sm:aspect-[5/4] sm:items-start sm:p-2',
                    selected === key ? 'border-neon-orange/60 bg-neon-orange/10' : 'border-transparent hover:bg-white/[0.05]',
                    key === todayKey ? 'font-semibold text-neon-orange' : 'text-zinc-300',
                  )}
                >
                  {date.getDate()}
                  <span className="mt-auto flex flex-wrap justify-center gap-0.5 sm:justify-start">
                    {list.slice(0, 4).map((t) => <span key={t.id} className={clsx('h-1.5 w-1.5 rounded-full', DOT[t.priority], t.status === 'Completed' && 'opacity-35')} />)}
                    {list.length > 4 && <span className="text-[10px] leading-none text-zinc-500">+{list.length - 4}</span>}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="glass p-5" aria-label="Tasks on selected day">
          <h2 className="font-display text-base font-semibold text-white">{formatDate(new Date(`${selected}T12:00:00`).toISOString(), true)}</h2>
          {selectedTasks.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-500">Nothing due on this day.</p>
          ) : (
            <ul className="mt-4 space-y-2.5">
              {selectedTasks.map((t) => (
                <li key={t.id}>
                  <Link to={`/tasks/${t.id}`} className="glow-hover block rounded-xl border border-white/[0.07] bg-black/30 p-3">
                    <p className={clsx('text-sm font-medium', t.status === 'Completed' ? 'text-zinc-500 line-through' : 'text-zinc-100')}>{t.title}</p>
                    <div className="mt-2"><PriorityBadge priority={t.priority} /></div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
