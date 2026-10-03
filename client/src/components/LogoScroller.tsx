const BRANDS = [
  { name: 'React', cls: 'font-display font-bold tracking-tight' },
  { name: 'MongoDB', cls: 'font-body font-semibold' },
  { name: 'Node.js', cls: 'font-display font-medium' },
  { name: 'TypeScript', cls: 'font-body font-bold tracking-tight' },
  { name: 'GitHub', cls: 'font-display font-semibold' },
  { name: 'Figma', cls: 'font-body font-medium italic' },
  { name: 'Notion', cls: 'font-display font-bold' },
  { name: 'Slack', cls: 'font-body font-semibold tracking-wide' },
];

/** Text wordmarks only: no third-party brand assets. The list renders twice for a seamless loop. */
export function LogoScroller() {
  const row = [...BRANDS, ...BRANDS];
  return (
    <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]" aria-label="Technologies and tools">
      <ul className="flex w-max animate-marquee items-center hover:[animation-play-state:paused] motion-reduce:animate-none">
        {row.map((b, i) => (
          <li key={`${b.name}-${i}`} aria-hidden={i >= BRANDS.length} className={`px-8 text-2xl text-zinc-500 transition-colors hover:text-neon-orange ${b.cls}`}>
            {b.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
