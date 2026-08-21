import { randomBytes } from 'node:crypto';
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

const listing = vercel(['env', 'ls', 'production']);
const values = {
  NEXT_PUBLIC_HOSTING_SALES_ENABLED: 'false',
  HOSTING_CREDENTIAL_KEY_VERSION: '1',
};
if (!listing.includes('HOSTING_CREDENTIAL_MASTER_KEY')) {
  values.HOSTING_CREDENTIAL_MASTER_KEY = randomBytes(32).toString('base64');
}

for (const [key, value] of Object.entries(values)) {
  vercel(['env', 'add', key, 'production', '--force'], value);
  console.log(`Configured production ${key}`);
}

console.log('Managed-hosting checkout remains disabled. Credential material was never printed.');
