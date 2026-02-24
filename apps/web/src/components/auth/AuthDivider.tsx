'use client';

interface AuthDividerProps {
  text?: string;
}

export function AuthDivider({ text = 'ou' }: AuthDividerProps) {
  return (
    <div className="relative my-6 flex items-center">
      <div className="flex-1 border-t border-border" />
      <span className="mx-3 text-xs text-muted-foreground">{text}</span>
      <div className="flex-1 border-t border-border" />
    </div>
  );
}
