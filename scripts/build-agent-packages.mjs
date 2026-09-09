#!/usr/bin/env node
/**
 * AGENT ADD-ON PACKAGE BUILDER
 *
 * Builds the six standalone $49 strategy agents as installable plugin packages.
 *
 * These already existed as ~950-line implementations, but they could never load, for three
 * stacked reasons: their manifest entryPoint pointed at a .ts file Node cannot require, the
 * runtime export is an object rather than a function, and their signal field is `direction`
 * where the engine reads `signal`. The loader now handles the last two. This script handles
 * the first, by shipping a compiled dist/ next to the readable src/ the customer is buying.
 *
 * Output layout per agent:
 *   manifest.json      entryPoint -> dist/strategy.js, source -> src/strategy.ts
 *   dist/strategy.js   what the runtime loads
 *   src/*.ts           what the customer reads and edits
 *   README.md          upstream docs
 *   INSTALL.md         generated: how to install into a Cival dashboard
 */

import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const SRC_ROOT = process.env.AGENT_PKG_ROOT
  || 'C:/Users/Anthony/AppData/Local/Temp/claude/store-audit/artifact-integrity/ex'
const OUT = path.resolve(process.env.PACKAGE_OUT || 'tmp/tier-packages')
const VERSION = '2.1.0'

const AGENTS = [
  { id: 'darvas-indicator',      productId: 'darvas-indicator',      name: 'Darvas Box Breakout Agent' },
  { id: 'elliott-wave-agent',    productId: 'elliott-wave-agent',    name: 'Elliott Wave Pattern Agent' },
  { id: 'vwap-momentum-agent',   productId: 'vwap-momentum-agent',   name: 'VWAP Pro Agent' },
  { id: 'heikin-ashi-agent',     productId: 'heikin-ashi-agent',     name: 'Heikin Ashi Trend Agent' },
  { id: 'mean-reversion-agent',  productId: 'mean-reversion-agent',  name: 'Bollinger Mean Reversion Agent' },
  { id: 'macro-sentiment-agent', productId: 'macro-sentiment-agent', name: 'Macro & On-Chain Sentiment Agent' },
]

const SECRET_RE = [
  /eyJhbGciOi[A-Za-z0-9_-]{10,}/, /sk_live_[A-Za-z0-9]{10,}/,
  /https:\/\/[a-z0-9]{20}\.supabase\.co/, /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
]
function scan(dir) {
  const hits = []
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name)
      if (e.isDirectory()) { walk(p); continue }
      let t; try { t = fs.readFileSync(p, 'utf8') } catch { continue }
      for (const re of SECRET_RE) {
        const m = t.match(re)
        if (m && !/0x0{64}/.test(m[0])) hits.push(`${path.relative(dir, p)}: ${m[0].slice(0, 14)}…`)
      }
    }
  }
  walk(dir)
  return hits
}

function installDoc(a) {
  return `# Installing ${a.name}

This is a strategy plugin for the Cival dashboard. It requires Core Edition or above.

## Install

1. Copy this whole folder into your dashboard's \`plugins/\` directory:

       plugins/
         ${a.id}/
           manifest.json
           dist/strategy.js
           src/strategy.ts

2. Restart the dashboard. The plugin loader scans \`plugins/\` on boot.

3. Confirm it registered. The loader reports every plugin it could not load, with the
   reason — if this agent does not appear, that report will say why rather than leaving you
   with an agent that silently does nothing.

## What loads, and what you edit

\`dist/strategy.js\` is what the runtime executes; \`src/strategy.ts\` is the readable source
and is what you own. If you change the source, rebuild:

    npx esbuild src/strategy.ts --bundle --format=cjs --platform=node --outfile=dist/strategy.js

## Configuration

\`manifest.json\` carries \`defaultConfig\`. Per-agent overrides passed by the dashboard are
merged over it, so you can tune a running agent without editing the package.

## Signals

\`execute(candles, config)\` returns \`{ direction: 'long' | 'short' | 'neutral', confidence,
reasoning, entry?, stopLoss?, takeProfit? }\`. The dashboard translates \`direction\` into its
own buy/sell/hold vocabulary at the plugin boundary — you do not need to match it.

A strategy that throws is treated as "no opinion" for that cycle and the reason is surfaced;
it cannot halt your other agents.
`
}

fs.mkdirSync(OUT, { recursive: true })
const summary = []
let failed = false

for (const a of AGENTS) {
  const src = path.join(SRC_ROOT, `${a.id}-v1.0.0`)
  if (!fs.existsSync(src)) { console.error(`  ${a.id}: SOURCE MISSING (${src})`); failed = true; continue }

  const label = `${a.id}-v${VERSION}`
  const stage = path.join(OUT, 'staging', label)
  fs.rmSync(stage, { recursive: true, force: true })
  fs.mkdirSync(path.join(stage, 'src'), { recursive: true })

  for (const f of fs.readdirSync(path.join(src, 'src'))) {
    fs.copyFileSync(path.join(src, 'src', f), path.join(stage, 'src', f))
  }
  const rd = path.join(src, 'README.md')
  if (fs.existsSync(rd)) fs.copyFileSync(rd, path.join(stage, 'README.md'))
  fs.writeFileSync(path.join(stage, 'INSTALL.md'), installDoc(a))

  const outJs = path.join(stage, 'dist', 'strategy.js')
  fs.mkdirSync(path.dirname(outJs), { recursive: true })
  try {
    execFileSync('npx', ['esbuild', path.join(stage, 'src', 'strategy.ts'),
      '--bundle', '--format=cjs', '--platform=node', `--outfile=${outJs}`, '--log-level=error'],
      { stdio: 'pipe', shell: true })
  } catch (e) {
    console.error(`  ${a.id}: esbuild FAILED — ${String(e.message).slice(0, 100)}`)
    failed = true; continue
  }

  const mf = JSON.parse(fs.readFileSync(path.join(src, 'manifest.json'), 'utf8'))
  mf.version = VERSION
  mf.entryPoint = 'dist/strategy.js'
  mf.source = 'src/strategy.ts'
  fs.writeFileSync(path.join(stage, 'manifest.json'), JSON.stringify(mf, null, 2) + '\n')

  const hits = scan(stage)
  if (hits.length) { console.error(`  ${a.id}: SECRET SCAN FAILED`, hits); failed = true; continue }

  const zip = path.join(OUT, `${label}.zip`)
  fs.rmSync(zip, { force: true })
  execFileSync('powershell', ['-NoProfile', '-Command',
    `Compress-Archive -Path '${stage}\\*' -DestinationPath '${zip}' -Force`], { stdio: 'pipe' })
  const buf = fs.readFileSync(zip)
  const digest = createHash('sha256').update(buf).digest('hex')
  console.log(`  ${a.id.padEnd(24)} ${String(buf.length).padStart(7)} B  dist=${fs.statSync(outJs).size} B  ${digest.slice(0, 16)}…`)
  summary.push({ productId: a.productId, version: VERSION, file: `${label}.zip`,
                 bytes: buf.length, sha256: digest })
}

const out = path.join(OUT, 'agent-packages.json')
fs.writeFileSync(out, JSON.stringify(summary, null, 2) + '\n')
console.log(`\nwrote ${out}  (${summary.length}/${AGENTS.length} agents)`)
if (failed) process.exit(1)
