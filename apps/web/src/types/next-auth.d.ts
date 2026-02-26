import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      onboardingStep: number;
      userRole: string | null;
      area: string | null;
      aiTone: string | null;
    } & DefaultSession['user'];
  }
}
