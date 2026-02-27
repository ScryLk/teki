import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../apps/web/.env.local') });

const prisma = new PrismaClient({
  log: ['error'],
});

async function createSuperAdmin() {
  const email = 'admin';
  const password = 'admin';

  console.log(`Creating super admin user: ${email}`);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('User already exists. Updating password and status...');
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.userCredential.update({
      where: { userId: existing.id },
      data: {
        passwordHash,
        hashAlgorithm: 'BCRYPT',
        failedAttempts: 0,
        lockedUntil: null,
      },
    });
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        status: 'ACTIVE',
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });
    console.log('Super admin updated successfully!');
    console.log(`  Email: ${email}`);
    console.log(`  Password: ${password}`);
    await prisma.$disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        email,
        firstName: 'Super',
        lastName: 'Admin',
        displayName: 'Super Admin',
        status: 'ACTIVE',
        emailVerified: true,
        emailVerifiedAt: new Date(),
        credentials: {
          create: {
            passwordHash,
            hashAlgorithm: 'BCRYPT',
          },
        },
        agents: {
          create: {
            name: 'Suporte Geral',
            systemPrompt:
              'Voce e um assistente de suporte tecnico de TI. Responda de forma clara e tecnica em portugues brasileiro.',
            model: 'gemini-flash',
            isDefault: true,
          },
        },
        preferences: {
          create: {},
        },
      },
    });

    return newUser;
  });

  console.log('Super admin created successfully!');
  console.log(`  ID: ${user.id}`);
  console.log(`  Email: ${email}`);
  console.log(`  Password: ${password}`);
  console.log(`  Status: ACTIVE`);

  await prisma.$disconnect();
}

createSuperAdmin().catch((err) => {
  console.error('Failed to create super admin:', err);
  prisma.$disconnect();
  process.exit(1);
});
