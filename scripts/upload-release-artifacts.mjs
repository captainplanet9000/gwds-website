import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

function parseEnv(contents) {
  const values = {};
  for (const line of contents.split(/\r?\n/)) {
    const split = line.indexOf('=');
    if (!line || line.startsWith('#') || split < 1) continue;
    let value = line.slice(split + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) value = JSON.parse(value);
    values[line.slice(0, split)] = value.replace(/[\r\n]+$/, '');
  }
  return values;
}

const envPath = process.argv[2] || 'tmp/target-production.env.secret';
const artifactDir = path.resolve(process.argv[3] || 'tmp/release-build/artifacts');
const env = parseEnv(await readFile(envPath, 'utf8'));
if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Supabase production credentials are required');
}

const manifest = JSON.parse(await readFile(path.join(artifactDir, 'release-manifest.json'), 'utf8'));
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const verified = [];
for (const artifact of manifest.artifacts) {
  const bytes = await readFile(path.join(artifactDir, artifact.file));
  const localHash = createHash('sha256').update(bytes).digest('hex');
  if (bytes.length !== artifact.bytes || localHash !== artifact.sha256) {
    throw new Error(`Local manifest mismatch for ${artifact.file}`);
  }

  const { error: uploadError } = await supabase.storage.from('downloads').upload(artifact.file, bytes, {
    contentType: 'application/zip',
    cacheControl: '3600',
    upsert: true,
  });
  if (uploadError) throw uploadError;

  const { data: remote, error: downloadError } = await supabase.storage.from('downloads').download(artifact.file);
  if (downloadError || !remote) throw downloadError || new Error(`Could not verify ${artifact.file}`);
  const remoteBytes = Buffer.from(await remote.arrayBuffer());
  const remoteHash = createHash('sha256').update(remoteBytes).digest('hex');
  if (remoteBytes.length !== artifact.bytes || remoteHash !== artifact.sha256) {
    throw new Error(`Remote verification mismatch for ${artifact.file}`);
  }
  verified.push({ file: artifact.file, bytes: remoteBytes.length, sha256: remoteHash });
}

console.log(JSON.stringify({ bucket: 'downloads', privateObjectsVerified: verified }, null, 2));
