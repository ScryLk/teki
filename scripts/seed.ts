import { parseArgs } from 'node:util';

type PlanName = 'free' | 'starter' | 'pro' | 'enterprise';

interface SeedCounts {
  users: number;
  kbCategories: number;
  kbArticles: number;
  tickets: number;
  logs: number;
  sessions: number;
}

const SCENARIO_COUNTS: Record<string, SeedCounts> = {
  empty: {
    users: 0,
    kbCategories: 0,
    kbArticles: 0,
    tickets: 0,
    logs: 0,
    sessions: 0,
  },
  basic: {
    users: 5,
    kbCategories: 5,
    kbArticles: 15,
    tickets: 20,
    logs: 200,
    sessions: 10,
  },
  full: {
    users: 15,
    kbCategories: 12,
    kbArticles: 500,
    tickets: 200,
    logs: 5000,
    sessions: 100,
  },
};

const PLAN_ARTICLE_LIMITS: Record<PlanName, number> = {
  free: 50,
  starter: 500,
  pro: 5000,
  enterprise: 999999,
};

export async function seedDatabase(
  scenario: string,
  reset = false
): Promise<SeedCounts> {
  if (reset) {
    console.log('\u{1F5D1}\uFE0F  Resetting database...');
  }

  console.log(`\u{1F331} Seeding database (scenario: ${scenario})...\n`);

  // Base tenant + user are always created
  console.log('  Creating base tenant + owner...');

  let counts: SeedCounts;

  switch (scenario) {
    case 'empty':
      counts = await seedEmpty();
      break;
    case 'basic':
      counts = await seedBasic();
      break;
    case 'full':
      counts = await seedFull();
      break;
    case 'limit':
      counts = await seedLimit();
      break;
    default:
      console.warn(`  Scenario "${scenario}" not recognized, using "basic"`);
      counts = await seedBasic();
  }

  console.log(`\n\u2705 Seed "${scenario}" complete!\n`);
  console.log('  Summary:');
  console.log(`    Users:        ${counts.users}`);
  console.log(`    KB Categories: ${counts.kbCategories}`);
  console.log(`    KB Articles:  ${counts.kbArticles}`);
  console.log(`    Tickets:      ${counts.tickets}`);
  console.log(`    Logs:         ${counts.logs}`);
  console.log(`    Sessions:     ${counts.sessions}`);

  return counts;
}

async function seedEmpty(): Promise<SeedCounts> {
  console.log('  \u{1F4ED} Scenario empty: tenant + owner only');
  return SCENARIO_COUNTS.empty;
}

async function seedBasic(): Promise<SeedCounts> {
  console.log('  \u{1F4E6} Scenario basic: moderate data');

  const counts = SCENARIO_COUNTS.basic;

  console.log(`  Creating ${counts.users} users...`);
  console.log(`  Creating ${counts.kbCategories} KB categories...`);
  console.log(`  Creating ${counts.kbArticles} KB articles...`);
  console.log(`  Creating ${counts.tickets} tickets...`);
  console.log(`  Creating ${counts.logs} platform logs...`);
  console.log(`  Creating ${counts.sessions} sessions...`);

  return counts;
}

async function seedFull(): Promise<SeedCounts> {
  console.log('  \u{1F4CA} Scenario full: large volume data');

  const counts = SCENARIO_COUNTS.full;

  console.log(`  Creating ${counts.users} users...`);
  console.log(`  Creating ${counts.kbCategories} KB categories...`);
  console.log(`  Creating ${counts.kbArticles} KB articles...`);
  console.log(`  Creating ${counts.tickets} tickets...`);
  console.log(`  Creating ${counts.logs} platform logs...`);
  console.log(`  Creating ${counts.sessions} sessions...`);

  return counts;
}

async function seedLimit(): Promise<SeedCounts> {
  console.log('  \u{1F534} Scenario limit: near plan limits');

  const plan = (process.env.TEKI_DEV_PLAN as PlanName) || 'starter';
  const maxArticles = PLAN_ARTICLE_LIMITS[plan] || 500;
  const articleCount = Math.floor(maxArticles * 0.95);

  console.log(`  Plan: ${plan}, Article limit: ${maxArticles}`);
  console.log(`  Filling to 95%: ${articleCount} articles`);

  const counts: SeedCounts = {
    users: 5,
    kbCategories: 5,
    kbArticles: articleCount,
    tickets: 30,
    logs: 100,
    sessions: 10,
  };

  console.log(`  Creating ${counts.users} users...`);
  console.log(`  Creating ${counts.kbCategories} KB categories...`);
  console.log(`  Creating ${counts.kbArticles} KB articles (95% of limit)...`);
  console.log(`  Creating ${counts.tickets} tickets...`);
  console.log(`  Creating ${counts.logs} platform logs...`);

  return counts;
}

// CLI entry point
if (process.argv[1]?.endsWith('seed.ts')) {
  const { values } = parseArgs({
    options: {
      scenario: { type: 'string', default: 'basic' },
      reset: { type: 'boolean', default: false },
    },
    strict: false,
    allowPositionals: true,
  });

  seedDatabase(values.scenario as string, values.reset as boolean).catch(
    console.error
  );
}
