import { spawnSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

const npxCli = path.join(path.dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npx-cli.js');

function vercel(args, input) {
  const result = spawnSync(process.execPath, [npxCli, 'vercel', ...args], {
    cwd: process.cwd(), input, encoding: 'utf8',
  });
  if (result.status !== 0) throw new Error((result.stderr || result.stdout || result.error?.message || 'Vercel command failed').trim());
  return `${result.stdout || ''}\n${result.stderr || ''}`;
}

const values = {
  NEXT_PUBLIC_HOSTING_SALES_ENABLED: 'false',
  HOSTING_AUTOMATION_ENABLED: 'false',
  VERCEL_HOSTING_TEAM_ID: 'team_UQDiJYPKA5kNGAaBbijEk5FX',
  CIVAL_CORE_GITHUB_REPO: 'captainplanet9000/ai-trading-dashboard',
  CIVAL_CORE_GITHUB_REPO_ID: '1173044109',
  CIVAL_CORE_GIT_REF: 'main',
};

for (const [key, value] of Object.entries(values)) {
  vercel(['env', 'add', key, 'production', '--force'], value);
  console.log(`Configured production ${key}`);
}

console.log('Managed paper-hosting checkout and automation remain disabled. Add a dedicated scoped automation token only for the tenant drill.');
