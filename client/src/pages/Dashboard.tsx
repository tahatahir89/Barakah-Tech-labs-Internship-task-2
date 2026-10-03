import { ArrowRight, ClipboardList, Plus } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Area, AreaChart, CartesianGrid } from 'recharts';
import { Link } from 'react-router-dom';
import { TaskCard } from '../components/TaskCard';
import { TaskStats } from '../components/TaskStats';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/States';
import { useAuth } from '../context/AuthContext';
import { useDashboardStats, useTasks } from '../hooks/useTasks';
import { toApiError } from '../services/api';
import type { TaskFilters } from '../types';

const RECENT: TaskFilters = { q: '', status: '', priority: '', category: '', due: '', sort: 'newest' };
const tooltipStyle = { background: '#130b09', border: '1px solid rgba(255,122,26,0.3)', borderRadius: 12, color: '#f4f4f5', fontSize: 12 };

export default function Dashboard() {
  const { user } = useAuth();
  const stats = useDashboardStats();
  const recent = useTasks(RECENT);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  if (stats.isError) return <ErrorState message={toApiError(stats.error).message} onRetry={() => stats.refetch()} />;

  const s = stats.data;
  const pie = s
    ? [
        { name: 'Completed', value: s.completed, color: '#34d399' },
        { name: 'In progress', value: s.inProgress, color: '#ff7a1a' },
        { name: 'To do', value: s.pending, color: '#ff2e3a' },
      ].filter((d) => d.value > 0)
    : [];
  const activity = s?.activity.map((a) => ({ ...a, day: new Date(`${a.date}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short' }) }));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">{greeting}, {user?.name.split(' ')[0]}</h1>
          <p className="mt-1 text-sm text-zinc-400">{s ? (s.overdue > 0 ? `${s.overdue} overdue and ${s.pending + s.inProgress} still open.` : `${s.pending + s.inProgress} tasks still open. Nothing overdue.`) : 'Loading your overview...'}</p>
        </div>
        <Link to="/tasks/create" className="btn-primary"><Plus className="h-4 w-4" /> New task</Link>
      </div>

      {s ? <TaskStats stats={s} /> : <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">{Array.from({ length: 6 }, (_, i) => <div key={i} className="glass h-28 animate-pulse" />)}</div>}

      {s && s.total > 0 && (
        <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          <section className="glass p-5" aria-label="Completed in the last 7 days">
            <h2 className="font-display text-base font-semibold text-white">Completed this week</h2>
            <div className="mt-4 h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activity} margin={{ left: -24, right: 8, top: 8 }}>
                  <defs>
                    <linearGradient id="fillOrange" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff7a1a" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#ff2e3a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="day" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: 'rgba(255,122,26,0.3)' }} />
                  <Area type="monotone" dataKey="count" name="Completed" stroke="#ff7a1a" strokeWidth={2} fill="url(#fillOrange)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>
          <section className="glass p-5" aria-label="Task status breakdown">
            <h2 className="font-display text-base font-semibold text-white">By status</h2>
            <div className="mt-4 h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pie} dataKey="value" nameKey="name" innerRadius={44} outerRadius={68} paddingAngle={3} stroke="none">
                    {pie.map((d) => <Cell key={d.name} fill={d.color} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-2 space-y-1.5 text-sm">
              {pie.map((d) => (
                <li key={d.name} className="flex items-center justify-between text-zinc-400">
                  <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: d.color }} />{d.name}</span>
                  <span className="text-zinc-200">{d.value}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}

      <section aria-label="Recent tasks">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-white">Recent tasks</h2>
          <Link to="/tasks" className="inline-flex items-center gap-1 text-sm text-neon-orange hover:underline">View all <ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>
        {recent.isLoading ? (
          <LoadingState rows={3} />
        ) : recent.isError ? (
          <ErrorState message={toApiError(recent.error).message} onRetry={() => recent.refetch()} />
        ) : recent.data && recent.data.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{recent.data.slice(0, 6).map((t, i) => <TaskCard key={t.id} task={t} index={i} />)}</div>
        ) : (
          <EmptyState icon={<ClipboardList className="h-6 w-6" />} title="No tasks yet" description="Start organizing your work by creating your first task." action={<Link to="/tasks/create" className="btn-primary"><Plus className="h-4 w-4" /> Create task</Link>} />
        )}
      </section>
    </div>
  );
}
