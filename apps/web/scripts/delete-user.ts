import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const EMAIL = 'lucaskepler991@gmail.com';

const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:root@localhost:5432/teki' });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.findFirst({ where: { email: EMAIL } });

  if (!user) {
    console.log(`Usuario ${EMAIL} nao encontrado.`);
    return;
  }

  console.log(`Encontrado: ${user.id} (${user.email})`);

  // Delete step by step to handle FK constraints
  const tm = await prisma.tenantMember.deleteMany({ where: { userId: user.id } });
  console.log(`tenantMembers: ${tm.count}`);

  const sess = await prisma.userSession.deleteMany({ where: { userId: user.id } });
  console.log(`sessions: ${sess.count}`);

  const msgs = await prisma.message.deleteMany({ where: { senderId: user.id } });
  console.log(`messages: ${msgs.count}`);

  const convs = await prisma.conversation.deleteMany({ where: { createdBy: user.id } });
  console.log(`conversations: ${convs.count}`);

  const keys = await prisma.apiKey.deleteMany({ where: { userId: user.id } });
  console.log(`apiKeys: ${keys.count}`);

  const dal = await prisma.dataAccessLog.deleteMany({ where: { subjectId: user.id } });
  console.log(`dataAccessLogs: ${dal.count}`);

  await prisma.user.delete({ where: { id: user.id } });
  console.log('Usuario removido com sucesso!');
}

main()
  .catch((e) => console.error('Erro:', e.message))
  .finally(() => prisma.$disconnect());
