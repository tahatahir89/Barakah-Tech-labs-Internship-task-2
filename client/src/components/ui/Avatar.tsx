import clsx from 'clsx';

interface Props {
  user: { name: string; profileImage: string | null; status?: 'active' | 'offline' };
  size?: number;
  showStatus?: boolean;
  className?: string;
}

export function UserAvatar({ user, size = 40, showStatus, className }: Props) {
  const initials = user.name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('');
  return (
    <span className={clsx('relative inline-flex shrink-0', className)} style={{ width: size, height: size }}>
      {user.profileImage ? (
        <img src={user.profileImage} alt={user.name} className="h-full w-full rounded-full object-cover ring-1 ring-white/15" />
      ) : (
        <span
          className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-neon-orange to-neon-red font-display font-semibold text-white"
          style={{ fontSize: size * 0.38 }}
          aria-label={user.name}
        >
          {initials || '?'}
        </span>
      )}
      {showStatus && (
        <span
          className={clsx('absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-ink', user.status === 'active' ? 'bg-emerald-400' : 'bg-zinc-500')}
          title={user.status === 'active' ? 'Active' : 'Offline'}
        />
      )}
    </span>
  );
}
