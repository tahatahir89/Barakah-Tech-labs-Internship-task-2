import { Link } from 'react-router-dom';
import { Logo } from './ui/Logo';

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-black/30">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Logo size={34} />
          <p className="mt-3 text-sm text-zinc-500">Task Manager. Organize your work. Stay productive.</p>
        </div>
        <nav className="flex gap-6 text-sm text-zinc-400" aria-label="Footer">
          <Link to="/login" className="hover:text-white">Login</Link>
          <Link to="/register" className="hover:text-white">Create account</Link>
        </nav>
      </div>
      <p className="border-t border-white/[0.04] py-4 text-center text-xs text-zinc-600">© 2026 Muhammad Taha. All rights reserved.</p>
    </footer>
  );
}
