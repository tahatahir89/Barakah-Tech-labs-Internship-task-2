import clsx from 'clsx';

/** The supplied logo has a black backdrop; `mix-blend-screen` lets it sit cleanly on the dark UI. */
export function Logo({ size = 36, wordmark = true, className }: { size?: number; wordmark?: boolean; className?: string }) {
  return (
    <span className={clsx('inline-flex items-center gap-2.5', className)}>
      <img src="/logo.png" alt={wordmark ? '' : 'TaskFlow'} width={size} height={size} style={{ width: size, height: size }} className="select-none mix-blend-screen" />
      {wordmark && (
        <span className="font-display text-lg font-bold tracking-tight text-white">
          Task<span className="text-gradient">Flow</span>
        </span>
      )}
    </span>
  );
}
