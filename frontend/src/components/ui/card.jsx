import { cn } from '../../lib/utils';

export function Card({ className, ...props }) {
  return <div className={cn('glass rounded-2xl', className)} {...props} />;
}

export function CardHeader({ className, ...props }) {
  return <div className={cn('p-5 pb-2', className)} {...props} />;
}

export function CardTitle({ className, ...props }) {
  return <h3 className={cn('text-lg font-bold text-white', className)} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={cn('p-5', className)} {...props} />;
}
