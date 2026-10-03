import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from './ui/Logo';

export function Navbar() {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-ink/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Link to="/" aria-label="TaskFlow home"><Logo size={36} /></Link>
        <nav className="hidden items-center gap-7 text-sm text-zinc-400 md:flex" aria-label="Page sections">
          <a href="#features" className="hover:text-white">Features</a>
          <a href="#stack" className="hover:text-white">Built with</a>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <Link to="/dashboard" className="btn-primary">Open dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">Login</Link>
              <Link to="/register" className="btn-primary">Get started</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
