import { cn } from '@/lib/utils';

type StatusColor = 'green' | 'yellow' | 'red' | 'gray' | 'blue';

interface StatusDotProps {
  color: StatusColor;
  pulse?: boolean;
  className?: string;
}

const colorMap: Record<StatusColor, string> = {
  green: 'bg-emerald-400',
  yellow: 'bg-amber-400',
  red: 'bg-red-400',
  gray: 'bg-zinc-500',
  blue: 'bg-blue-400',
};

export default function StatusDot({ color, pulse, className }: StatusDotProps) {
  return (
    <span
      className={cn(
        'inline-block w-2 h-2 rounded-full',
        colorMap[color],
        pulse && 'animate-pulse',
        className
      )}
    />
  );
}
