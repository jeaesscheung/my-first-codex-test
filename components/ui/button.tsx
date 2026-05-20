import { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cn('rounded-xl border border-cyan-300/40 bg-cyan-400/10 px-5 py-2.5 text-sm font-semibold hover:shadow-glow transition', className)} {...props} />;
}
