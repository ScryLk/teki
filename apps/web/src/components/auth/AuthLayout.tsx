'use client';

import { AuthCatMascot, type CatState } from './AuthCatMascot';

interface AuthLayoutProps {
  children: React.ReactNode;
  catState?: CatState;
}

export function AuthLayout({ children, catState = 'idle' }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4">
      {/* Grid dots background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'radial-gradient(circle, currentColor 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />

      {/* Cat mascot */}
      <div className="mb-6">
        <AuthCatMascot state={catState} />
      </div>

      {/* Auth card slot */}
      {children}

      {/* Footer */}
      <footer className="mt-8 pb-6 text-center text-xs text-muted-foreground">
        <p>
          &copy; {new Date().getFullYear()} Teki &mdash; Suporte inteligente
          com IA
        </p>
      </footer>
    </div>
  );
}
