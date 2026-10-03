import clsx from 'clsx';
import { motion } from 'framer-motion';
import { CalendarDays, CheckCircle2, Clock, ListTodo, LogOut, LayoutDashboard, PlusCircle, Settings, User as UserIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { timeAgo } from '../utils/format';
import { UserAvatar } from './ui/Avatar';
import { Logo } from './ui/Logo';

interface Item { to: string; label: string; icon: LucideIcon }

const ITEMS: Item[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tasks', label: 'My Tasks', icon: ListTodo },
  { to: '/tasks/create', label: 'Create Task', icon: PlusCircle },
  { to: '/tasks?status=Completed', label: 'Completed', icon: CheckCircle2 },
  { to: '/tasks?status=Todo', label: 'Pending', icon: Clock },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/profile', label: 'Profile', icon: UserIcon },
  { to: '/settings', label: 'Settings', icon: Settings },
];

function useIsActive() {
  const { pathname, search } = useLocation();
  return (to: string) => {
    const [path, query] = to.split('?');
    if (query) return pathname === path && search === `?${query}`;
    if (path === '/tasks') return (pathname === '/tasks' && !search.includes('status=')) || (pathname.startsWith('/tasks/') && pathname !== '/tasks/create');
    return pathname === path || pathname.startsWith(`${path}/`);
  };
}

export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isActive = useIsActive();

  const onLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-white/[0.06] bg-ink/70 backdrop-blur-xl lg:flex">
      <Link to="/dashboard" className="px-6 pb-4 pt-6"><Logo size={38} /></Link>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2" aria-label="Main">
        {ITEMS.map(({ to, label, icon: Icon }) => {
          const active = isActive(to);
          return (
            <Link
              key={to}
              to={to}
              aria-current={active ? 'page' : undefined}
              className={clsx('relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors', active ? 'text-white' : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100')}
            >
              {active && (
                <motion.span layoutId="nav-active" className="absolute inset-0 rounded-xl border border-neon-orange/30 bg-gradient-to-r from-neon-orange/15 to-neon-red/5" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />
              )}
              <Icon className={clsx('relative h-[18px] w-[18px]', active && 'text-neon-orange')} />
              <span className="relative">{label}</span>
            </Link>
          );
        })}
        <button onClick={onLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-red-500/10 hover:text-red-300">
          <LogOut className="h-[18px] w-[18px]" /> Logout
        </button>
      </nav>

      {user && (
        <Link to="/profile" className="m-3 flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 transition hover:border-neon-orange/30">
          <UserAvatar user={user} size={38} showStatus />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{user.name}</p>
            <p className="truncate text-xs text-zinc-500">{user.status === 'active' ? 'Active now' : `Last active ${timeAgo(user.lastActive)}`}</p>
          </div>
        </Link>
      )}
    </aside>
  );
}

const MOBILE: Item[] = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/tasks', label: 'Tasks', icon: ListTodo },
  { to: '/tasks/create', label: 'New', icon: PlusCircle },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/profile', label: 'Profile', icon: UserIcon },
];

export function MobileNav() {
  const isActive = useIsActive();
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
      <ul className="mx-auto flex max-w-md items-end justify-around px-2">
        {MOBILE.map(({ to, label, icon: Icon }) => {
          const active = isActive(to);
          const primary = to === '/tasks/create';
          return (
            <li key={to}>
              <Link to={to} aria-current={active ? 'page' : undefined} className={clsx('flex min-w-[58px] flex-col items-center gap-0.5 px-2 py-2 text-[11px] font-medium', active ? 'text-neon-orange' : 'text-zinc-500')}>
                {primary ? (
                  <span className="-mt-5 rounded-2xl bg-gradient-to-br from-neon-orange to-neon-red p-3 text-white shadow-neon"><Icon className="h-5 w-5" /></span>
                ) : (
                  <Icon className="h-5 w-5" />
                )}
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
