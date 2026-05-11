import { cn } from '../../lib/utils';

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'h-11 w-full rounded-xl border border-white/10 bg-white/[.06] px-4 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-300/60 focus:ring-2 focus:ring-emerald-400/20',
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        'min-h-28 w-full rounded-xl border border-white/10 bg-white/[.06] px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-300/60 focus:ring-2 focus:ring-emerald-400/20',
        className,
      )}
      {...props}
    />
  );
}
