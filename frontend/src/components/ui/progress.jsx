import { cn } from '../../lib/utils';

export function Progress({ value = 0, className }) {
  return (
    <div className={cn('h-2 overflow-hidden rounded-full bg-white/10', className)}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-sky-400 to-violet-400 transition-all duration-700"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
