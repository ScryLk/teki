import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../apps/web/.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter, log: ['error'] });

const ADMIN_EMAIL = 'admin@teki.com';
const ADMIN_PASSWORD = 'admin';
const TENANT_NAME = 'Teki';
const TENANT_SLUG = 'teki';

async function setup() {
  console.log('\n--- Teki Setup ---\n');

  // 1. Create or update admin user
  console.log('[1/4] Criando usuario admin...');
  let user = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });

  if (user) {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    await prisma.userCredential.upsert({
      where: { userId: user.id },
      update: { passwordHash, hashAlgorithm: 'BCRYPT', failedAttempts: 0, lockedUntil: null },
      create: { userId: user.id, passwordHash, hashAlgorithm: 'BCRYPT' },
    });
    await prisma.user.update({
      where: { id: user.id },
      data: { status: 'ACTIVE', emailVerified: true, emailVerifiedAt: new Date() },
    });
    console.log('  Usuario admin atualizado.');
  } else {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    user = await prisma.user.create({
      data: {
        email: ADMIN_EMAIL,
        firstName: 'Super',
        lastName: 'Admin',
        displayName: 'Super Admin',
        status: 'ACTIVE',
        emailVerified: true,
        emailVerifiedAt: new Date(),
        credentials: {
          create: { passwordHash, hashAlgorithm: 'BCRYPT' },
        },
        preferences: {
          create: {},
        },
      },
    });
    console.log('  Usuario admin criado.');
  }

  // 2. Create or find tenant
  console.log('[2/4] Criando tenant...');
  let tenant = await prisma.tenant.findUnique({ where: { slug: TENANT_SLUG } });

  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        name: TENANT_NAME,
        slug: TENANT_SLUG,
        plan: 'FREE',
        status: 'ACTIVE',
      },
    });
    console.log('  Tenant criado.');
  } else {
    console.log('  Tenant ja existe.');
  }

  // 3. Link user to tenant as OWNER
  console.log('[3/4] Vinculando admin ao tenant...');
  const existingMembership = await prisma.tenantMember.findFirst({
    where: { userId: user.id, tenantId: tenant.id },
  });

  if (!existingMembership) {
    await prisma.tenantMember.create({
      data: {
        userId: user.id,
        tenantId: tenant.id,
        role: 'OWNER',
        status: 'ACTIVE',
      },
    });
    console.log('  Membership OWNER criada.');
  } else {
    console.log('  Membership ja existe.');
  }

  // 4. Create default agent
  console.log('[4/4] Criando agente padrao...');
  const existingAgent = await prisma.agent.findFirst({
    where: { userId: user.id },
  });

  if (!existingAgent) {
    await prisma.agent.create({
      data: {
        userId: user.id,
        name: 'Suporte Geral',
        systemPrompt:
          'Voce e um assistente de suporte tecnico de TI. Responda de forma clara e tecnica em portugues brasileiro.',
        model: 'gemini-flash',
        isDefault: true,
      },
    });
    console.log('  Agente "Suporte Geral" criado.');
  } else {
    console.log('  Agente ja existe.');
  }

  console.log('\n--- Setup completo! ---\n');
  console.log('  Credenciais:');
  console.log(`    Email:    ${ADMIN_EMAIL}`);
  console.log(`    Senha:    ${ADMIN_PASSWORD}`);
  console.log(`    Tenant:   ${TENANT_NAME} (${TENANT_SLUG})`);
  console.log(`    Plano:    FREE`);
  console.log('\n  Acesse: http://localhost:3000\n');
  console.log('  Para upgrade, va em: /settings/billing/upgrade\n');

  await prisma.$disconnect();
  await pool.end();
}

setup().catch((err) => {
  console.error('Setup falhou:', err);
  prisma.$disconnect();
  pool.end();
  process.exit(1);
});
