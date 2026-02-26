import type { Adapter, AdapterUser, AdapterAccount, AdapterSession } from 'next-auth/adapters';
import type { PrismaClient } from '@prisma/client';

/**
 * Custom NextAuth adapter that bridges our existing User schema
 * (firstName, lastName, displayName, avatarUrl, emailVerified as Boolean)
 * with the NextAuth adapter interface (name, image, emailVerified as DateTime).
 *
 * Uses NextAuthAccount/NextAuthSession Prisma models mapped to
 * nextauth_accounts/nextauth_sessions DB tables to avoid conflicts
 * with existing UserAuthProvider/UserSession tables.
 */
export function TekiPrismaAdapter(prisma: PrismaClient): Adapter {
  return {
    async createUser(data) {
      const nameParts = (data.name || '').split(' ');
      const firstName = nameParts[0] || data.email.split('@')[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : null;

      const user = await prisma.user.create({
        data: {
          email: data.email.toLowerCase().trim(),
          firstName,
          lastName,
          displayName: data.name || firstName,
          name: data.name,
          image: data.image,
          avatarUrl: data.image,
          emailVerified: !!data.emailVerified,
          emailVerifiedAt: data.emailVerified ?? undefined,
          status: 'ACTIVE',
          firstLoginAt: new Date(),
        },
      });

      return mapUser(user);
    },

    async getUser(id) {
      const user = await prisma.user.findUnique({ where: { id } });
      return user ? mapUser(user) : null;
    },

    async getUserByEmail(email) {
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });
      return user ? mapUser(user) : null;
    },

    async getUserByAccount({ provider, providerAccountId }) {
      const account = await (prisma as any).nextAuthAccount.findUnique({
        where: {
          provider_providerAccountId: { provider, providerAccountId },
        },
        include: { user: true },
      });
      return account?.user ? mapUser(account.user) : null;
    },

    async updateUser({ id, ...data }) {
      const updateData: Record<string, unknown> = {};
      if (data.name !== undefined) {
        updateData.name = data.name;
        updateData.displayName = data.name;
      }
      if (data.email !== undefined) updateData.email = data.email;
      if (data.image !== undefined) {
        updateData.image = data.image;
        updateData.avatarUrl = data.image;
      }
      if (data.emailVerified !== undefined) {
        updateData.emailVerified = !!data.emailVerified;
        updateData.emailVerifiedAt = data.emailVerified;
      }

      const user = await prisma.user.update({
        where: { id },
        data: updateData,
      });
      return mapUser(user);
    },

    async deleteUser(id) {
      await prisma.user.delete({ where: { id } });
    },

    async linkAccount(data) {
      await (prisma as any).nextAuthAccount.create({
        data: {
          userId: data.userId,
          type: data.type,
          provider: data.provider,
          providerAccountId: data.providerAccountId,
          refresh_token: data.refresh_token,
          access_token: data.access_token,
          expires_at: data.expires_at,
          token_type: data.token_type,
          scope: data.scope,
          id_token: data.id_token,
        },
      });
    },

    async unlinkAccount({ provider, providerAccountId }) {
      await (prisma as any).nextAuthAccount.deleteMany({
        where: { provider, providerAccountId },
      });
    },

    async createSession(data) {
      const session = await (prisma as any).nextAuthSession.create({
        data: {
          sessionToken: data.sessionToken,
          userId: data.userId,
          expires: data.expires,
        },
      });
      return session as AdapterSession;
    },

    async getSessionAndUser(sessionToken) {
      const session = await (prisma as any).nextAuthSession.findUnique({
        where: { sessionToken },
        include: { user: true },
      });
      if (!session) return null;
      return {
        session: {
          id: session.id,
          sessionToken: session.sessionToken,
          userId: session.userId,
          expires: session.expires,
        } as AdapterSession,
        user: mapUser(session.user),
      };
    },

    async updateSession(data) {
      const session = await (prisma as any).nextAuthSession.update({
        where: { sessionToken: data.sessionToken },
        data,
      });
      return session as AdapterSession;
    },

    async deleteSession(sessionToken) {
      await (prisma as any).nextAuthSession.deleteMany({
        where: { sessionToken },
      });
    },

    async createVerificationToken(data) {
      const token = await prisma.verificationToken.create({ data });
      return token;
    },

    async useVerificationToken({ identifier, token }) {
      try {
        const result = await prisma.verificationToken.delete({
          where: { identifier_token: { identifier, token } },
        });
        return result;
      } catch {
        return null;
      }
    },
  };
}

function mapUser(user: any): AdapterUser {
  return {
    id: user.id,
    email: user.email,
    emailVerified: user.emailVerifiedAt ?? (user.emailVerified ? new Date() : null),
    name: user.name ?? user.displayName ?? user.firstName,
    image: user.image ?? user.avatarUrl,
  };
}
