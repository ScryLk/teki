import { parseArgs } from 'node:util';
import { spawn } from 'node:child_process';

const { values: flags } = parseArgs({
  options: {
    plan: { type: 'string', default: 'pro' },
    role: { type: 'string', default: 'owner' },
    seed: { type: 'string', default: 'basic' },
    'dev-tools': { type: 'boolean', default: true },
    'no-dev-tools': { type: 'boolean', default: false },
    target: { type: 'string', default: 'web' },
    port: { type: 'string', default: '3000' },
    'skip-seed': { type: 'boolean', default: false },
  },
  strict: false,
  allowPositionals: true,
});

const config = {
  plan: flags.plan as string,
  role: flags.role as string,
  seed: flags.seed as string,
  devTools: flags['no-dev-tools'] ? false : flags['dev-tools'],
  target: flags.target as string,
  port: flags.port as string,
};

async function main() {
  console.log('\n\u{1F527} Teki Development Mode\n');
  console.log(`  Plan:      ${config.plan}`);
  console.log(`  Role:      ${config.role}`);
  console.log(`  Seed:      ${config.seed}`);
  console.log(`  DevTools:  ${config.devTools ? 'ON' : 'OFF'}`);
  console.log(`  Target:    ${config.target}`);
  console.log(`  Port:      ${config.port}\n`);

  // Define environment variables
  const env = {
    ...process.env,
    NODE_ENV: 'development',
    TEKI_DEV_PLAN: config.plan,
    TEKI_DEV_ROLE: config.role,
    TEKI_DEV_TOOLS: config.devTools ? 'true' : 'false',
    TEKI_DEV_SEED: config.seed,
    PORT: config.port,
  };

  // Start application
  if (config.target === 'desktop') {
    spawn('pnpm', ['--filter', '@teki/desktop', 'dev'], {
      env,
      stdio: 'inherit',
      shell: true,
    });
  } else {
    spawn('pnpm', ['--filter', '@teki/web', 'dev'], {
      env,
      stdio: 'inherit',
      shell: true,
    });
  }
}

main().catch(console.error);
