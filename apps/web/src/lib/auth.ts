import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = (credentials.email as string).toLowerCase().trim();

        // Find user with credentials (separate table for security isolation)
        const user = await prisma.user.findUnique({
          where: { email },
          include: { credentials: true },
        });

        if (!user || user.status !== 'ACTIVE' || !user.credentials) return null;

        // Check account lockout
        if (
          user.credentials.lockedUntil &&
          user.credentials.lockedUntil > new Date()
        ) {
          return null;
        }

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.credentials.passwordHash
        );

        if (!valid) {
          // Increment failed attempts
          const failedAttempts = user.credentials.failedAttempts + 1;
          await prisma.userCredential.update({
            where: { userId: user.id },
            data: {
              failedAttempts,
              // Lock after 5 failed attempts for 15 minutes
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

        // Update last login metadata
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.displayName ?? user.firstName,
        };
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
    ...(process.env.GITHUB_CLIENT_ID
      ? [
          GitHub({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
          }),
        ]
      : []),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async signIn({ user, account }) {
      if (!account || account.provider === 'credentials') return true;

      // OAuth flow: link or create user
      const email = user.email?.toLowerCase().trim();
      if (!email) return false;

      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        // Link provider if not already linked
        const existing = await prisma.userAuthProvider.findFirst({
          where: {
            userId: existingUser.id,
            provider: account.provider.toUpperCase() as 'GOOGLE' | 'GITHUB' | 'MICROSOFT',
            providerUserId: account.providerAccountId,
          },
        });

        if (!existing) {
          await prisma.userAuthProvider.create({
            data: {
              userId: existingUser.id,
              provider: account.provider.toUpperCase() as 'GOOGLE' | 'GITHUB' | 'MICROSOFT',
              providerUserId: account.providerAccountId,
              providerEmail: email,
              providerName: user.name,
              providerAvatarUrl: user.image,
              accessTokenEncrypted: account.access_token,
              refreshTokenEncrypted: account.refresh_token,
              tokenExpiresAt: account.expires_at
                ? new Date(account.expires_at * 1000)
                : undefined,
            },
          });
        }

        // Update last login
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { lastLoginAt: new Date() },
        });

        user.id = existingUser.id;
      } else {
        // Create new user from OAuth
        const nameParts = (user.name || 'User').split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined;

        const newUser = await prisma.user.create({
          data: {
            email,
            firstName,
            lastName,
            displayName: user.name || firstName,
            avatarUrl: user.image,
            emailVerified: true,
            emailVerifiedAt: new Date(),
            status: 'ACTIVE',
            lastLoginAt: new Date(),
            authProviders: {
              create: {
                provider: account.provider.toUpperCase() as 'GOOGLE' | 'GITHUB' | 'MICROSOFT',
                providerUserId: account.providerAccountId,
                providerEmail: email,
                providerName: user.name,
                providerAvatarUrl: user.image,
                isPrimary: true,
                accessTokenEncrypted: account.access_token,
                refreshTokenEncrypted: account.refresh_token,
                tokenExpiresAt: account.expires_at
                  ? new Date(account.expires_at * 1000)
                  : undefined,
              },
            },
          },
        });

        user.id = newUser.id;
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    newUser: '/register',
  },
});
