#!/usr/bin/env node
/**
 * Upload built packages to Supabase Storage and print the SQL to register them.
 *
 * Deliberately does NOT flip is_active. Ordering matters: the artifact has to exist and be
 * verifiable in storage before a product row claims it is purchasable, or the store spends
 * the window in between taking money it cannot deliver against. Upload here, verify, then
 * activate as a separate deliberate step.
 */

import fs from 'node:fs'
import path from 'node:path'

const OUT = path.resolve(process.env.PACKAGE_OUT || 'tmp/tier-packages')
const BUCKET = 'downloads'

function env(name) {
  for (const line of fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
    if (line.startsWith(name + '=')) return line.slice(name.length + 1).trim().replace(/^["']|["']$/g, '')
  }
  return null
}

const url = env('NEXT_PUBLIC_SUPABASE_URL')
const key = env('SUPABASE_SERVICE_ROLE_KEY') || env('SUPABASE_SERVICE_KEY')
if (!url || !key) { console.error('missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local'); process.exit(1) }

const tiers = JSON.parse(fs.readFileSync(path.join(OUT, 'packages.json'), 'utf8'))
const agents = JSON.parse(fs.readFileSync(path.join(OUT, 'agent-packages.json'), 'utf8'))
const all = [...tiers, ...agents]

const rows = []
for (const p of all) {
  const file = path.join(OUT, p.file)
  const body = fs.readFileSync(file)
  const res = await fetch(`${url}/storage/v1/object/${BUCKET}/${p.file}`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${key}`,
      'content-type': 'application/zip',
      'x-upsert': 'true',
    },
    body,
  })
  const ok = res.ok
  console.log(`  ${ok ? 'uploaded' : 'FAILED  '}  ${p.file.padEnd(34)} ${String(body.length).padStart(8)} B  ${ok ? '' : await res.text()}`)
  if (ok) rows.push(p)
}

console.log('\n-- Register the artifacts. Run this, verify, THEN activate separately.\n')
for (const p of rows) {
  console.log(
    `update products set artifact_path='${p.file}', artifact_sha256='${p.sha256}', ` +
    `artifact_size_bytes=${p.bytes}, artifact_ready=true where id='${p.productId}';`)
}
console.log(`\n-- ${rows.length}/${all.length} uploaded`)
