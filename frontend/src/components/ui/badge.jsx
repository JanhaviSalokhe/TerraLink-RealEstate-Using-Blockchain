import { cn } from '../../lib/utils';

export function Badge({ className, variant = 'emerald', ...props }) {
  const variants = {
    emerald: 'border-emerald-300/30 bg-emerald-400/10 text-emerald-200',
    blue: 'border-sky-300/30 bg-sky-400/10 text-sky-200',
    violet: 'border-violet-300/30 bg-violet-400/10 text-violet-200',
    neutral: 'border-white/15 bg-white/10 text-slate-200',
  };

  return (
    <span
      className={cn('inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold', variants[variant], className)}
      {...props}
    />
  );
}
