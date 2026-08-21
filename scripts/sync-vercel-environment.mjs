import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

function parseEnv(contents) {
  const values = {};
  for (const line of contents.split(/\r?\n/)) {
    if (!line || line.startsWith('#')) continue;
    const split = line.indexOf('=');
    if (split < 1) continue;
    const key = line.slice(0, split);
    let value = line.slice(split + 1);
    if (value.startsWith('"') && value.endsWith('"')) {
      value = JSON.parse(value);
    }
    values[key] = value;
  }
  return values;
}

const sourcePath = path.resolve(process.argv[2] || 'tmp/vercel-gwds-env-audit/.env.gwds.production.local');
const source = parseEnv(await readFile(sourcePath, 'utf8'));
const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
  'SUPPORT_EMAIL',
  'GWDS_ADMIN_SESSION_SECRET',
  'CIVAL_RATE_LIMIT_SECRET',
  'NEWSLETTER_SIGNING_SECRET',
];

for (const key of required) {
  if (!source[key]) throw new Error(`Source production environment is missing ${key}`);
}

const desired = {
  ...Object.fromEntries(required.map((key) => [key, source[key].replace(/[\r\n]+$/, '')])),
  NEXT_PUBLIC_SITE_URL: 'https://www.civalsystems.com',
  NEXT_PUBLIC_STORE_SALES_ENABLED: 'false',
  NEXT_PUBLIC_HOSTING_SALES_ENABLED: 'false',
  STRIPE_AUTOMATIC_TAX: 'false',
  HOSTING_AUTOMATION_ENABLED: 'false',
  VERCEL_HOSTING_TEAM_ID: 'team_UQDiJYPKA5kNGAaBbijEk5FX',
  CIVAL_CORE_GITHUB_REPO: 'captainplanet9000/ai-trading-dashboard',
  CIVAL_CORE_GITHUB_REPO_ID: '1173044109',
  CIVAL_CORE_GIT_REF: 'main',
};
const npxCli = path.join(path.dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npx-cli.js');

for (const [key, value] of Object.entries(desired)) {
  const result = spawnSync(process.execPath, [npxCli, 'vercel', 'env', 'add', key, 'production', '--force'], {
    cwd: process.cwd(),
    // The CLI reads piped input until EOF. Adding a line terminator persists that
    // character in the remote value and breaks HTTP authorization headers.
    input: value,
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    throw new Error(`Could not set ${key}: ${result.error?.message || (result.stderr || result.stdout || '').trim()}`);
  }
  console.log(`Configured ${key}`);
}

console.log('Production environment copied with checkout explicitly paused.');
