import { motion } from 'framer-motion';
import { Activity, AlertTriangle, CheckCircle2, Clock, Flame, ListTodo } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { DashboardStats } from '../types';

export function TaskStats({ stats }: { stats: DashboardStats }) {
  const cards = [
    { label: 'Total tasks', value: stats.total, icon: ListTodo, to: '/tasks', tone: 'text-zinc-200' },
    { label: 'Completed', value: stats.completed, icon: CheckCircle2, to: '/tasks?status=Completed', tone: 'text-emerald-400' },
    { label: 'In progress', value: stats.inProgress, icon: Activity, to: '/tasks?status=In Progress', tone: 'text-neon-orange' },
    { label: 'Pending', value: stats.pending, icon: Clock, to: '/tasks?status=Todo', tone: 'text-sky-300' },
    { label: 'High priority', value: stats.highPriority, icon: Flame, to: '/tasks?sort=priority', tone: 'text-amber-400' },
    { label: 'Overdue', value: stats.overdue, icon: AlertTriangle, to: '/tasks?due=overdue', tone: 'text-neon-red' },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map(({ label, value, icon: Icon, to, tone }, i) => (
        <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.25 }}>
          <Link to={to} className="glass glow-hover block p-4">
            <Icon className={`h-5 w-5 ${tone}`} />
            <p className="mt-4 font-display text-3xl font-bold text-white">{value}</p>
            <p className="mt-0.5 text-xs text-zinc-500">{label}</p>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
