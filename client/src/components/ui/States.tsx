import { AlertTriangle, Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from './Button';

export const LoadingSpinner = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <Loader2 className={`animate-spin text-neon-orange ${className}`} aria-label="Loading" />
);

export function LoadingState({ rows = 6 }: { rows?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="glass h-44 animate-pulse p-5">
          <div className="h-4 w-20 rounded bg-white/10" />
          <div className="mt-5 h-5 w-3/4 rounded bg-white/10" />
          <div className="mt-3 h-3 w-full rounded bg-white/5" />
          <div className="mt-2 h-3 w-2/3 rounded bg-white/5" />
        </div>
      ))}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="glass flex flex-col items-center px-6 py-14 text-center" role="alert">
      <div className="mb-4 rounded-2xl bg-red-500/10 p-3 text-red-400"><AlertTriangle className="h-6 w-6" /></div>
      <h3 className="font-display text-lg font-semibold text-white">That didn't load</h3>
      <p className="mt-1.5 max-w-sm text-sm text-zinc-400">{message}</p>
      {onRetry && <Button variant="outline" className="mt-5" onClick={onRetry}>Try again</Button>}
    </div>
  );
}

interface EmptyProps { icon: ReactNode; title: string; description: string; action?: ReactNode }

export function EmptyState({ icon, title, description, action }: EmptyProps) {
  return (
    <div className="glass flex flex-col items-center px-6 py-16 text-center">
      <div className="mb-4 rounded-2xl bg-neon-orange/10 p-3.5 text-neon-orange shadow-neon">{icon}</div>
      <h3 className="font-display text-lg font-semibold text-white">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-zinc-400">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
