import { motion } from 'framer-motion';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { MobileNav, Sidebar } from '../components/Sidebar';
import { UserAvatar } from '../components/ui/Avatar';
import { Logo } from '../components/ui/Logo';
import { useAuth } from '../context/AuthContext';
import { useHeartbeat, useRealtime } from '../hooks/useRealtime';

export default function AppLayout() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  useRealtime(user?.id);
  useHeartbeat(!!user);

  return (
    <div className="min-h-screen">
      <Sidebar />
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/[0.06] bg-ink/80 px-4 py-3 backdrop-blur-xl lg:hidden">
        <Link to="/dashboard" aria-label="Dashboard"><Logo size={32} /></Link>
        {user && <Link to="/profile" aria-label="Profile"><UserAvatar user={user} size={34} showStatus /></Link>}
      </header>
      <main className="px-4 pb-28 pt-6 sm:px-6 lg:ml-64 lg:px-10 lg:pb-12 lg:pt-10">
        <motion.div key={pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="mx-auto max-w-6xl">
          <Outlet />
        </motion.div>
      </main>
      <MobileNav />
    </div>
  );
}
