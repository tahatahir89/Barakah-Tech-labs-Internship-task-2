import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './ui/Logo';

interface Props { title: string; subtitle: string; children: ReactNode; footer: ReactNode }

export function AuthShell({ title, subtitle, children, footer }: Props) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-white/[0.06] p-12 lg:flex">
        <div className="pointer-events-none absolute -left-24 top-1/3 h-96 w-96 rounded-full bg-neon-orange/20 blur-[120px]" aria-hidden />
        <div className="pointer-events-none absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-neon-red/20 blur-[120px]" aria-hidden />
        <Link to="/" className="relative"><Logo size={44} /></Link>
        <div className="relative">
          <h2 className="font-display text-4xl font-bold leading-tight text-white">
            Manage Your Work.
            <span className="text-gradient block">Organize Your Life.</span>
          </h2>
          <p className="mt-5 max-w-md text-zinc-400">Tasks, notes, sketches and images in one fast workspace that stays in sync across every device you use.</p>
        </div>
        <p className="relative text-xs text-zinc-600">© 2026 Muhammad Taha</p>
      </aside>

      <main className="flex items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-6 flex justify-center lg:hidden" aria-label="TaskFlow home"><Logo size={64} wordmark={false} /></Link>
          <div className="mb-8 text-center lg:text-left">
            <h1 className="font-display text-3xl font-bold text-white">{title}</h1>
            <p className="mt-2 text-sm text-zinc-400">{subtitle}</p>
          </div>
          {children}
          <p className="mt-8 text-center text-sm text-zinc-400">{footer}</p>
        </div>
      </main>
    </div>
  );
}
