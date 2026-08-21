import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

function loadEnv(file) {
  const env = {};
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    if (!line || line.startsWith('#')) continue;
    const splitAt = line.indexOf('=');
    if (splitAt < 1) continue;
    let value = line.slice(splitAt + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1).replace(/\\n/g, '\n');
    env[line.slice(0, splitAt)] = value;
  }
  return env;
}

const envPath = process.argv[2] || '.env.local';
const outputDirectory = path.resolve(process.argv[3] || 'tmp/release-audit');
const env = loadEnv(envPath);
if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Supabase URL and service role key are required');
}

fs.mkdirSync(outputDirectory, { recursive: true });
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const { data: objects, error: listError } = await supabase.storage.from('downloads').list('', {
  limit: 100,
  sortBy: { column: 'name', order: 'asc' },
});
if (listError) throw listError;

const forbidden = [
  /(^|\/)\.env($|\.(?!example$))/i,
  /(^|\/)\.git\//i,
  /(^|\/)node_modules\//i,
  /(^|\/)\.next\//i,
  /(^|\/)(credentials?|secrets?)\.(json|ya?ml|txt)$/i,
  /(^|\/).+\.(pem|p12|pfx|key)$/i,
  /(^|\/).+\.(sqlite|sqlite3|db)$/i,
];
const required = ['README.md', 'LICENSE.md', '.env.example', 'package.json'];
const results = [];

for (const object of objects || []) {
  if (!object.name.toLowerCase().endsWith('.zip')) continue;
  const { data, error } = await supabase.storage.from('downloads').download(object.name);
  if (error || !data) {
    results.push({ name: object.name, error: error?.message || 'download failed' });
    continue;
  }

  const buffer = Buffer.from(await data.arrayBuffer());
  const destination = path.join(outputDirectory, object.name);
  fs.writeFileSync(destination, buffer);
  const entries = execFileSync('tar', ['-tf', destination], { encoding: 'utf8' })
    .split(/\r?\n/)
    .map((entry) => entry.replace(/\\/g, '/'))
    .filter(Boolean);
  const violations = entries.filter((entry) => forbidden.some((pattern) => pattern.test(entry)));
  const missing = required.filter((name) => !entries.some((entry) => entry === name || entry.endsWith(`/${name}`)));
  const sourceFiles = entries.filter((entry) => /\.(ts|tsx|js|jsx|py|sol|sql)$/i.test(entry)).length;

  results.push({
    name: object.name,
    bytes: buffer.length,
    sha256: createHash('sha256').update(buffer).digest('hex'),
    entries: entries.length,
    sourceFiles,
    missing,
    violations: [...new Set(violations)].slice(0, 20),
  });
}

console.log(JSON.stringify({ outputDirectory, objects: results }, null, 2));
