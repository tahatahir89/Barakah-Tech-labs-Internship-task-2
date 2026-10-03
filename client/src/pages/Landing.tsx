import { motion } from 'framer-motion';
import { ArrowRight, ImagePlus, Lock, PenTool, Radio, Search, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { LogoScroller } from '../components/LogoScroller';
import { Navbar } from '../components/Navbar';
import { PriorityBadge, StatusBadge } from '../components/ui/Badges';
import { useSmoothScroll } from '../hooks/useSmoothScroll';
import type { Priority, TaskStatus } from '../types';

const ROWS: { title: string; priority: Priority; status: TaskStatus; due: string }[] = [
  { title: 'Ship the pricing page', priority: 'Urgent', status: 'In Progress', due: 'Today' },
  { title: 'Sketch onboarding flow', priority: 'High', status: 'Todo', due: 'Thu' },
  { title: 'Review pull requests', priority: 'Medium', status: 'Completed', due: 'Mon' },
];

function Mockup() {
  return (
    <div className="glass relative overflow-hidden p-4 shadow-glow sm:p-5" aria-hidden>
      <div className="mb-4 flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-neon-red" /><span className="h-2.5 w-2.5 rounded-full bg-neon-amber" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        <span className="ml-3 text-xs text-zinc-500">Dashboard</span>
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {[['Total', '24'], ['Done', '14'], ['Overdue', '2']].map(([l, v]) => (
          <div key={l} className="rounded-xl border border-white/[0.07] bg-black/30 p-3">
            <p className="font-display text-2xl font-bold text-white">{v}</p>
            <p className="text-[11px] text-zinc-500">{l}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 space-y-2.5">
        {ROWS.map((r) => (
          <div key={r.title} className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-black/30 p-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-zinc-100">{r.title}</p>
              <p className="mt-0.5 text-[11px] text-zinc-500">Due {r.due}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row"><PriorityBadge priority={r.priority} /><StatusBadge status={r.status} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

const FEATURES = [
  { icon: LayoutDashboard, title: 'A dashboard that answers "what now?"', text: 'Totals, overdue work and a seven-day completion chart, all one tap from the tasks behind them.' },
  { icon: PenTool, title: 'Sketch on any task', text: 'Pencil, pen and eraser with undo and redo. Keep diagrams and quick notes next to the work.' },
  { icon: ImagePlus, title: 'Attach images', text: 'Drop in screenshots and references. Big photos are resized for you before they upload.' },
  { icon: Radio, title: 'Live across devices', text: 'Finish a task on your phone and your laptop updates instantly.' },
  { icon: Search, title: 'Find anything', text: 'Search titles and descriptions, then filter by status, priority, category or due date.' },
  { icon: Lock, title: 'Private by design', text: 'HTTP-only session cookies, hashed passwords, and every task checked against its owner on the server.' },
];

export default function Landing() {
  useSmoothScroll();
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <section className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-16 lg:grid-cols-[1.05fr_1fr] lg:pt-24">
          <div className="pointer-events-none absolute -top-10 right-0 h-96 w-96 rounded-full bg-neon-red/15 blur-[130px]" aria-hidden />
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative">
            <h1 className="font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl">
              Manage Your Work.
              <span className="text-gradient block pb-1">Organize Your Life.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-zinc-400">
              TaskFlow keeps tasks, notes, sketches and images in one place and keeps every device in sync, so you always know what to do next.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/register" className="btn-primary px-6 py-3">Get Started <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/login" className="btn-outline px-6 py-3">Login</Link>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }} className="relative">
            <div className="animate-float motion-reduce:animate-none"><Mockup /></div>
          </motion.div>
        </section>

        <section id="stack" className="border-y border-white/[0.06] bg-black/20 py-10" aria-labelledby="stack-title">
          <p id="stack-title" className="mb-6 text-center text-sm text-zinc-500">Built with the tools modern teams already use</p>
          <LogoScroller />
        </section>

        <section id="features" className="mx-auto max-w-6xl px-5 py-24">
          <h2 className="max-w-xl font-display text-3xl font-bold text-white sm:text-4xl">Everything a task needs, attached to the task.</h2>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, text }, i) => (
              <motion.div key={title} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.35, delay: (i % 3) * 0.06 }} className="glass glow-hover p-6">
                <div className="mb-4 inline-flex rounded-xl bg-neon-orange/10 p-2.5 text-neon-orange"><Icon className="h-5 w-5" /></div>
                <h3 className="font-display text-base font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{text}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-24">
          <div className="glass relative overflow-hidden px-6 py-14 text-center sm:px-12">
            <div className="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-48 w-2/3 rounded-full bg-neon-orange/20 blur-[90px]" aria-hidden />
            <h2 className="relative font-display text-3xl font-bold text-white">Create your first task in under a minute.</h2>
            <p className="relative mx-auto mt-3 max-w-md text-zinc-400">Free to start. No setup, nothing to install.</p>
            <Link to="/register" className="btn-primary relative mt-8 px-7 py-3">Create account</Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
