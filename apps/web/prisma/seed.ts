import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'default@teki.app' },
    update: {},
    create: {
      id: 'default-user',
      email: 'default@teki.app',
      name: 'Usuário Padrão',
    },
  });

  console.log('Default user created:', user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
