import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Resend from 'next-auth/providers/resend';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import { TekiPrismaAdapter } from './auth-adapter';
import { sendMagicLinkEmail } from './auth-email';
import bcrypt from 'bcryptjs';

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: TekiPrismaAdapter(prisma),

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),

    Resend({
      apiKey: process.env.RESEND_API_KEY!,
      from: process.env.EMAIL_FROM || 'Teki <acesso@teki.com.br>',
      async sendVerificationRequest({ identifier: email, url }) {
        await sendMagicLinkEmail({ email, url });
      },
    }),

    Credentials({
      id: 'credentials',
      name: 'Senha',
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = (credentials.email as string).toLowerCase().trim();

        const user = await prisma.user.findUnique({
          where: { email },
          include: { credentials: true },
        });

        if (!user || user.status !== 'ACTIVE') return null;

        // User exists but never set a password
        if (!user.credentials) return null;

        // Check account lockout
        if (
          user.credentials.lockedUntil &&
          user.credentials.lockedUntil > new Date()
        ) {
          return null;
        }

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.credentials.passwordHash,
        );

        if (!valid) {
          const failedAttempts = user.credentials.failedAttempts + 1;
          await prisma.userCredential.update({
            where: { userId: user.id },
            data: {
              failedAttempts,
              ...(failedAttempts >= 5
                ? { lockedUntil: new Date(Date.now() + 15 * 60 * 1000) }
                : {}),
            },
          });
          return null;
        }

        // Reset failed attempts on successful login
        await prisma.userCredential.update({
          where: { userId: user.id },
          data: { failedAttempts: 0, lockedUntil: null },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.displayName ?? user.firstName,
          image: user.avatarUrl,
        };
      },
    }),
  ],

  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: '/entrar',
    verifyRequest: '/verificar',
    error: '/entrar',
  },

  callbacks: {
    async signIn({ user, account }) {
      if (user.id && account) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { firstLoginAt: true },
        });

        if (dbUser && !dbUser.firstLoginAt) {
          await prisma.$transaction([
            prisma.user.update({
              where: { id: user.id },
              data: {
                firstLoginAt: new Date(),
                lastLoginAt: new Date(),
              },
            }),
            prisma.agent.create({
              data: {
                userId: user.id,
                name: 'Suporte Geral',
                systemPrompt:
                  'Voce e um assistente de suporte tecnico de TI. Responda de forma clara, direta e tecnica em portugues brasileiro. Forneca passos numerados quando aplicavel.',
                model: 'gemini-flash',
                isDefault: true,
              },
            }),
          ]);
        } else {
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          });
        }
      }
      return true;
    },

    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;

        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            onboardingStep: true,
            userRole: true,
            area: true,
            aiTone: true,
            name: true,
            displayName: true,
            image: true,
            avatarUrl: true,
          },
        });

        if (dbUser) {
          (session.user as any).onboardingStep = dbUser.onboardingStep;
          (session.user as any).userRole = dbUser.userRole;
          (session.user as any).area = dbUser.area;
          (session.user as any).aiTone = dbUser.aiTone;
          session.user.name = dbUser.name ?? dbUser.displayName;
          session.user.image = dbUser.image ?? dbUser.avatarUrl;
        }
      }
      return session;
    },
  },

  events: {
    async createUser({ user }) {
      console.log(`[Auth] New user created: ${user.email}`);
    },
  },
});
