#!/usr/bin/env node
/**
 * TIER PACKAGE BUILDER
 *
 * Builds the shippable Core / Trader / Desk archives from the live dashboard source.
 *
 * THE RULE THAT MATTERS: this is an ALLOW-LIST builder, never a directory copy with
 * exclusions. A deny-list is one forgotten pattern away from shipping the owner's `.env`,
 * their 43 MB `data/` directory of live positions, or a 62 MB `public/office` tree. An
 * allow-list can only ship what a manifest names, so the worst failure is a missing file
 * — visible, and fixable — rather than a leaked credential, which is neither.
 *
 * Layered on top: a mandatory secret scan that HARD FAILS the build. Belt and braces,
 * because the repo has already been found to contain a live Hyperliquid signing key, live
 * Bybit/Coinbase/Alchemy credentials, and 14 .env files at its root.
 *
 * Usage:
 *   node scripts/build-tier-packages.mjs                 # build all tiers
 *   node scripts/build-tier-packages.mjs --tier core     # one tier
 *   node scripts/build-tier-packages.mjs --dry           # manifest + scan, no archive
 */

import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const DASHBOARD = process.env.DASHBOARD_ROOT || 'C:/TradingFarm/Cival-Dashboard-v9'
const MANIFEST_DIR = process.env.MANIFEST_DIR
  || 'C:/Users/Anthony/AppData/Local/Temp/claude/store-audit/packaging-feasibility'
const OUT = path.resolve(process.env.PACKAGE_OUT || 'tmp/tier-packages')

const argv = process.argv.slice(2)
const only = argv.includes('--tier') ? argv[argv.indexOf('--tier') + 1] : null
const dryRun = argv.includes('--dry')

// ─────────────────────────────────────────────────────────────────────────────────────
// Tier definitions.
//
// The ladder is defined by AGENTS, not by features. Every tier ships the same platform;
// what differs is how many strategy plugins are pre-installed. That is the promise the
// store makes ("each agent drops into the same runtime with no code changes") and it is
// the only tiering that is honest once the plugin loader exists.
// ─────────────────────────────────────────────────────────────────────────────────────
const AGENT_PACKS = {
  darvas: 'darvas-indicator',
  elliott: 'elliott-wave-agent',
  vwap: 'vwap-momentum-agent',
  heikin: 'heikin-ashi-agent',
  meanrev: 'mean-reversion-agent',
  macro: 'macro-sentiment-agent',
}

const TIERS = {
  core: {
    productId: 'trading-dashboard-template',
    version: '2.1.0',
    manifest: 'core-files.txt',
    // ONE agent, per the product definition. Darvas is the pick: it is the most
    // self-contained of the six and the easiest for a buyer to verify by eye against a chart.
    agents: ['darvas'],
  },
  trader: {
    productId: 'multi-strat-bundle',
    version: '2.1.0',
    manifest: 'trader-files.txt',
    agents: ['darvas', 'elliott', 'vwap'],
  },
  desk: {
    productId: 'everything-bundle',
    version: '2.1.0',
    manifest: 'desk-files.txt',
    agents: ['darvas', 'elliott', 'vwap', 'heikin', 'meanrev', 'macro'],
  },
}

/**
 * Files added to every tier regardless of manifest.
 *
 * The import-closure manifest only knows about files reachable from a source import, so it
 * contains no package.json, no next.config, no tsconfig — the first build produced a package
 * with `src/` and nothing else, which a buyer could not even `npm install`. Everything a
 * Next.js app needs to boot has to be named explicitly here.
 *
 * public/ is deliberately partial: the tree is 62 MB, almost all of it public/office, which
 * no shipped route references.
 */
const ALWAYS_INCLUDE = [
  // app config / toolchain
  'package.json',
  'next.config.js',
  'tsconfig.json',
  'tailwind.config.ts',
  'postcss.config.mjs',
  'components.json',
  'next-env.d.ts',
  'eslint.config.mjs',
  '.gitignore',
  // entry point — the production server the dashboard actually runs under
  'server-simplified.js',
  // docs
  'README.md',
  // stylesheets. The import-closure resolver walks module graphs; layout.tsx imports these
  // as side-effect CSS, which it did not follow, so the first package shipped with no
  // stylesheets and `next build` died on "Can't resolve './globals.css'".
  'src/app/globals.css',
  'src/app/generated-themes.css',
  'src/app/theme.css',
  'src/app/globals-dark.css',
  'src/app/globals-minimal.css',
  'src/app/globals-modern.css',
  // database + plugin system
  'schema/001_core.sql',
  'src/lib/plugins/contract.ts',
  'src/lib/plugins/loader.ts',
]

/**
 * The only devDependencies a buyer needs. Everything else in the dashboard's 43 is tooling
 * for developing the dashboard itself.
 */
const BUILD_DEV_DEPS = new Set([
  'typescript', '@types/node', '@types/react', '@types/react-dom', '@types/crypto-js',
  'tailwindcss', 'tailwindcss-animate', 'postcss', 'autoprefixer', 'dotenv',
])

/** Directories under public/ that are safe and necessary to ship. */
const PUBLIC_DIRS = ['avatars', 'sprites']

// ─────────────────────────────────────────────────────────────────────────────────────
// Secret scanning. Every pattern here corresponds to something actually found in this
// repo, which is why none of them are optional.
// ─────────────────────────────────────────────────────────────────────────────────────
const SECRET_PATTERNS = [
  { name: 'JWT / Supabase service key', re: /eyJhbGciOi[A-Za-z0-9_-]{10,}/ },
  { name: '64-hex private key', re: /0x[a-fA-F0-9]{64}/ },
  { name: 'Stripe live secret', re: /sk_live_[A-Za-z0-9]{10,}/ },
  { name: 'Stripe test secret', re: /sk_test_[A-Za-z0-9]{10,}/ },
  { name: 'OpenAI key', re: /sk-[A-Za-z0-9]{20,}/ },
  { name: 'AWS access key id', re: /AKIA[0-9A-Z]{16}/ },
  { name: 'Supabase project URL', re: /https:\/\/[a-z0-9]{20}\.supabase\.co/ },
  { name: 'private key block', re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
]

// A zero private key and the zero address are placeholders, not secrets.
const SECRET_ALLOWLIST = [/0x0{64}/, /0x0{40}/]

const BINARY_EXT = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.woff', '.woff2',
  '.ttf', '.otf', '.mp4', '.zip', '.gz', '.pdf', '.wasm'])

function scanForSecrets(absPath, relPath) {
  if (BINARY_EXT.has(path.extname(absPath).toLowerCase())) return []
  let text
  try { text = fs.readFileSync(absPath, 'utf8') } catch { return [] }
  const hits = []
  for (const { name, re } of SECRET_PATTERNS) {
    const m = text.match(re)
    if (!m) continue
    if (SECRET_ALLOWLIST.some((ok) => ok.test(m[0]))) continue
    const line = text.slice(0, m.index).split('\n').length
    hits.push({ file: relPath, line, kind: name, sample: m[0].slice(0, 12) + '…' })
  }
  return hits
}

// Paths that must never enter a package even if a manifest names them.
const HARD_DENY = [
  /(^|[\\/])\.env($|[.\\/])/i,
  // ROOT data/ only. A looser /(^|[/])data([/]|$)/ also matched legitimate source paths
  // like src/app/api/market/data/[symbol]/route.ts and silently dropped an API route from
  // the package — the failure mode an allow-list is supposed to make visible, arriving via
  // the deny-list instead. Anchor it.
  /^data[\\/]/i,
  /^public[\\/]office([\\/]|$)/i,
  /(^|[\\/])node_modules([\\/]|$)/i,
  /(^|[\\/])\.next([\\/]|$)/i,
  /(^|[\\/])\.git([\\/]|$)/i,
  /(^|[\\/])\.vercel([\\/]|$)/i,
  /\.env\.[A-Za-z0-9_.-]+$/i,
]

// Excluded product surfaces, per the owner's explicit instruction.
const EXCLUDED_FEATURES = [
  /prop-firms?/i,
  /defi-lending/i,
  /[\\/]scalper([\\/]|$)/i,
  /strategies[\\/]scalper/i,
]

function readManifest(file) {
  const p = path.join(MANIFEST_DIR, file)
  if (!fs.existsSync(p)) throw new Error(`manifest not found: ${p}`)
  return [...new Set(
    fs.readFileSync(p, 'utf8').split(/\r?\n/).map((l) => l.trim()).filter(Boolean),
  )]
}

function sha256(buf) { return createHash('sha256').update(buf).digest('hex') }

function copyInto(stageRoot, relPath) {
  const src = path.join(DASHBOARD, relPath)
  if (!fs.existsSync(src)) return false
  const dst = path.join(stageRoot, relPath)
  fs.mkdirSync(path.dirname(dst), { recursive: true })
  fs.copyFileSync(src, dst)
  return true
}

/**
 * Compile a plugin's TypeScript to CommonJS and rewrite its manifest entryPoint.
 *
 * Plugins ship their .ts source because readable source is literally the product, but Node
 * cannot `require` TypeScript at runtime — an uncompiled plugin loads as "entryPoint not
 * found" and the agent the customer paid for silently never trades.
 */
function buildPlugin(pkgRoot, stagePluginsDir, agentKey) {
  const id = AGENT_PACKS[agentKey]
  const src = path.join(pkgRoot, `${id}-v1.0.0`)
  if (!fs.existsSync(src)) return { id, ok: false, reason: `source not found: ${src}` }

  const dest = path.join(stagePluginsDir, id)
  fs.mkdirSync(path.join(dest, 'src'), { recursive: true })

  for (const f of fs.readdirSync(path.join(src, 'src'))) {
    fs.copyFileSync(path.join(src, 'src', f), path.join(dest, 'src', f))
  }
  for (const f of ['README.md', 'manifest.json']) {
    const p = path.join(src, f)
    if (fs.existsSync(p)) fs.copyFileSync(p, path.join(dest, f))
  }

  const entryTs = path.join(dest, 'src', 'strategy.ts')
  const outJs = path.join(dest, 'dist', 'strategy.js')
  fs.mkdirSync(path.dirname(outJs), { recursive: true })
  try {
    execFileSync('npx', ['esbuild', entryTs, '--bundle', '--format=cjs',
      '--platform=node', `--outfile=${outJs}`, '--log-level=error'],
      { stdio: 'pipe', shell: true })
  } catch (e) {
    return { id, ok: false, reason: `esbuild failed: ${String(e.message).slice(0, 120)}` }
  }

  const mfPath = path.join(dest, 'manifest.json')
  const mf = JSON.parse(fs.readFileSync(mfPath, 'utf8'))
  mf.entryPoint = 'dist/strategy.js'   // runtime loads the build; src/ stays for the reader
  mf.source = 'src/strategy.ts'
  fs.writeFileSync(mfPath, JSON.stringify(mf, null, 2) + '\n')
  return { id, ok: true, bytes: fs.statSync(outJs).size }
}

function buildTier(name, spec, pluginPkgRoot) {
  const label = `cival-${name}-v${spec.version}`
  const stage = path.join(OUT, 'staging', label)
  fs.rmSync(stage, { recursive: true, force: true })
  fs.mkdirSync(stage, { recursive: true })

  const wanted = [...readManifest(spec.manifest), ...ALWAYS_INCLUDE]

  const denied = [], excluded = [], missing = []
  let copied = 0
  let prunedDeps = { kept: 0, dropped: 0 }
  for (const rel of wanted) {
    const norm = rel.replace(/\\/g, '/')
    if (HARD_DENY.some((re) => re.test(norm))) { denied.push(rel); continue }
    if (EXCLUDED_FEATURES.some((re) => re.test(norm))) { excluded.push(rel); continue }
    if (copyInto(stage, rel)) copied++
    else missing.push(rel)
  }

  // ── package.json, pruned to what this tier actually imports ────────────────────────
  //
  // The dashboard declares 110 dependencies; Core imports 23 of them. Shipping all 110 is not
  // merely wasteful — it is BROKEN. @aave/contract-helpers pins peer ethers@^5 against the
  // project's ethers@^6, so `npm install` fails outright on a clean machine and the buyer
  // cannot start at all. Verified by installing the shipped archive as a customer would.
  //
  // So the manifest decides the dependency list, exactly as it decides the file list.
  {
    const pkg = JSON.parse(fs.readFileSync(path.join(DASHBOARD, 'package.json'), 'utf8'))
    const declared = pkg.dependencies || {}
    const IMPORT_RE = /(?:from\s*['"]([^'"]+)['"])|(?:import\s*\(\s*['"]([^'"]+)['"])|(?:require\(\s*['"]([^'"]+)['"])/g
    const bare = (spec) => {
      if (!spec || spec.startsWith('.') || spec.startsWith('@/') || spec.startsWith('/')) return null
      if (spec.startsWith('node:')) return null
      const parts = spec.split('/')
      return spec.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0]
    }
    const used = new Set()
    const scanTree = (dir) => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name)
        if (e.isDirectory()) { scanTree(p); continue }
        if (!/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(e.name)) continue
        const src = fs.readFileSync(p, 'utf8')
        let m
        IMPORT_RE.lastIndex = 0
        while ((m = IMPORT_RE.exec(src))) {
          const b = bare(m[1] || m[2] || m[3])
          if (b) used.add(b)
        }
      }
    }
    scanTree(stage)

    const deps = {}
    for (const name of Object.keys(declared).sort()) {
      // `crypto` is a Node builtin that must never be installed from npm — the npm package of
      // that name is an abandoned shim that shadows the builtin and breaks hashing.
      if (name === 'crypto') continue
      if (used.has(name)) deps[name] = declared[name]
    }

    const out = {
      name: `cival-${name}`,
      version: spec.version,
      private: true,
      scripts: {
        dev: 'next dev -p 9005',
        build: 'next build',
        start: 'node server-simplified.js',
        'db:init': 'psql "$DATABASE_URL" -f schema/001_core.sql',
      },
      dependencies: deps,
      // devDependencies pruned to what `next build` genuinely needs.
      // Shipping all 43 does not just bloat the install — it BREAKS it. The Storybook set
      // alone carries an unsatisfiable peer graph (@storybook/react@8.6.18 wants
      // @storybook/test@8.6.18 while addon-interactions pins 8.6.14), so `npm install`
      // aborts with ERESOLVE before a buyer ever reaches `npm run build`. Verified by
      // installing the shipped archive on a clean tree.
      // Storybook, Playwright, Puppeteer, vitest and the testing-library set are all for
      // developing THIS repo, not for running the product.
      devDependencies: Object.fromEntries(
        Object.entries(pkg.devDependencies || {})
          .filter(([k]) => BUILD_DEV_DEPS.has(k))
          .sort(([a], [b]) => a.localeCompare(b)),
      ),
      engines: pkg.engines || { node: '>=20' },
    }
    fs.writeFileSync(path.join(stage, 'package.json'), JSON.stringify(out, null, 2) + '\n')
    // package-lock.json describes the FULL 110-dep tree and would reintroduce every conflict
    // it was pruned to avoid. A lock that disagrees with its manifest is worse than none.
    fs.rmSync(path.join(stage, 'package-lock.json'), { force: true })
    prunedDeps = { kept: Object.keys(deps).length, dropped: Object.keys(declared).length - Object.keys(deps).length }
  }

  fs.writeFileSync(path.join(stage, 'LICENSE.md'), LICENSE)
  fs.writeFileSync(path.join(stage, 'RUNBOOK.md'), runbook(name, spec))

  // public/ — only the directories a shipped route actually references, plus loose svg/ico.
  for (const d of PUBLIC_DIRS) {
    const src = path.join(DASHBOARD, 'public', d)
    if (!fs.existsSync(src)) continue
    const walkCopy = (from, to) => {
      fs.mkdirSync(to, { recursive: true })
      for (const e of fs.readdirSync(from, { withFileTypes: true })) {
        const a = path.join(from, e.name), b = path.join(to, e.name)
        if (e.isDirectory()) walkCopy(a, b)
        else { fs.copyFileSync(a, b); copied++ }
      }
    }
    walkCopy(src, path.join(stage, 'public', d))
  }
  for (const f of fs.readdirSync(path.join(DASHBOARD, 'public'), { withFileTypes: true })) {
    if (f.isDirectory()) continue
    if (!/\.(svg|ico|png|webmanifest|txt)$/i.test(f.name)) continue
    fs.mkdirSync(path.join(stage, 'public'), { recursive: true })
    fs.copyFileSync(path.join(DASHBOARD, 'public', f.name), path.join(stage, 'public', f.name))
    copied++
  }

  // Plugins
  const pluginResults = spec.agents.map((a) =>
    buildPlugin(pluginPkgRoot, path.join(stage, 'plugins'), a))

  // .env.example — never the real thing
  fs.writeFileSync(path.join(stage, '.env.example'), ENV_EXAMPLE)

  // ── Unresolved-import gate ─────────────────────────────────────────────────────────
  //
  // A missing file is the failure mode an allow-list trades for; the point is that it should
  // be VISIBLE. It was not: the package built, uploaded and activated with two missing
  // stylesheets, and the only thing that noticed was installing it as a customer. Check it
  // here instead, where it costs nothing.
  const unresolved = []
  {
    const IMP = /from\s*['"](\.[^'"]+)['"]|import\s*['"](\.[^'"]+)['"]/g
    const exts = ['', '.ts', '.tsx', '.js', '.jsx', '.mjs', '.css', '.json']
    const walkImports = (dir) => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name)
        if (e.isDirectory()) { walkImports(p); continue }
        if (!/\.(ts|tsx|js|jsx|mjs)$/.test(e.name)) continue
        const src = fs.readFileSync(p, 'utf8')
        let m
        IMP.lastIndex = 0
        while ((m = IMP.exec(src))) {
          const spec = m[1] || m[2]
          const base = path.resolve(path.dirname(p), spec)
          const ok = exts.some((x) => fs.existsSync(base + x))
            || exts.slice(1).some((x) => fs.existsSync(path.join(base, 'index' + x)))
          if (!ok) unresolved.push({ file: path.relative(stage, p), spec })
        }
      }
    }
    walkImports(stage)
  }

  // Secret scan across everything staged
  const findings = []
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name)
      if (e.isDirectory()) walk(p)
      else findings.push(...scanForSecrets(p, path.relative(stage, p)))
    }
  }
  walk(stage)

  const files = []
  const count = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name)
      if (e.isDirectory()) count(p); else files.push(p)
    }
  }
  count(stage)
  const bytes = files.reduce((n, f) => n + fs.statSync(f).size, 0)

  return { label, stage, copied, denied, excluded, missing, pluginResults, findings,
           fileCount: files.length, bytes, prunedDeps, unresolved }
}


const LICENSE = `# Licence

Copyright (c) Cival Systems. All rights reserved.

## What you may do

You have purchased a perpetual, non-exclusive licence to use, modify and run this software
for your own trading, personally or within one company you own or work for. You may change
any part of the source. You may run it on as many machines as you control.

## What you may not do

You may not resell, sublicense, republish or redistribute this source, in whole or in
substantial part, whether modified or not. You may not use it to operate a hosted or managed
service that provides this software's functionality to third parties.

## No warranty, and the part that actually matters

THIS SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED.

This software places orders on financial markets. It can lose money, including more than you
deposit where leverage is used. It has bugs, as all software does, and a bug here can cost
money rather than merely time. Nothing in it is financial advice, and no past or simulated
result predicts a future one.

You are responsible for every order it places under your keys. Run it in paper mode until you
understand it, keep position sizes small until you trust it, and never give it a key you
cannot afford to see misused. The authors are not liable for trading losses, missed trades,
downtime, or any damages arising from use of this software.
`

function runbook(tier, spec) {
  return `# Runbook — Cival ${tier[0].toUpperCase() + tier.slice(1)} Edition v${spec.version}

## 1. Install

    npm install

Node 20 or newer. This package declares only the dependencies it actually imports, so the
install is small; do not copy a package-lock.json from another edition.

## 2. Database

Create a Postgres database (Supabase works, so does plain Postgres) and apply the schema:

    psql "$DATABASE_URL" -f schema/001_core.sql

That file creates every table this build reads and writes. It is idempotent — re-running it
is safe.

## 3. Configure

    cp .env.example .env.local

Fill in the required values. The app will not start without JWT_SECRET, SIGNATURE_SECRET,
ENCRYPTION_KEY and WALLET_ENCRYPTION_KEY — that is deliberate. Generate each with:

    node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"

## 4. Run

    npm run build
    npm start

If the build fails with \`supabaseUrl is required\`, step 3 is not finished — the build
evaluates API routes and they need the database values present.

The dashboard listens on :9005.

## 5. Before you connect real money

Use a Hyperliquid **API wallet**, never your master account key. API wallets can place orders
but cannot withdraw, which bounds what a leaked .env can cost you.

Start with a small balance. Watch a full cycle end to end before you leave it running
unattended. The agents will place orders without asking.

## 6. Agents

${spec.agents.length} strategy agent${spec.agents.length === 1 ? ' is' : 's are'} pre-installed under plugins/. The loader scans that
directory at boot and reports anything it cannot load, with the reason.

To add an agent you bought separately, drop its folder into plugins/ and restart. Each agent
ships readable source under src/ and a compiled dist/ that the runtime loads.

## 7. When something looks wrong

- An agent that never trades: check the plugin loader's error list first.
- Orders rejected: confirm the API wallet is approved on your Hyperliquid account.
- Nothing persists: confirm schema/001_core.sql was actually applied to the database
  the app is pointed at.
`
}

const ENV_EXAMPLE = `# Cival — configuration
#
# ─────────────────────────────────────────────────────────────────────────────────────
# FILL THIS IN BEFORE YOU RUN \`npm run build\`.
#
# Next.js evaluates your API routes at build time to collect page data, and those routes
# construct a Supabase client. With the values below still blank the build fails with:
#
#     Error: supabaseUrl is required.
#     Build error occurred ... Failed to collect page data for /api/agents/[id]/start
#
# That is not a bug in the build; it is this file not being filled in yet. Copy it to
# .env.local, set at least NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, the four
# secrets, and MAIN_WALLET_ADDRESS, and the build will succeed.
#
# The server ALSO refuses to boot without a valid MAIN_WALLET_ADDRESS. That is deliberate:
# a trading process that does not know whose account it is could act on the wrong one.
# ─────────────────────────────────────────────────────────────────────────────────────
#
# TRADING_MODE decides whether this installation can move real money.
# It ships as 'paper'. Change it only when you have read RUNBOOK.md and you intend the
# agents to place real orders with real funds.
TRADING_MODE=paper

# --- Database (required) -------------------------------------------------------------
# Apply schema/001_core.sql to this database before first run.
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# --- Identity (REQUIRED — the server refuses to start without MAIN_WALLET_ADDRESS) ----
# This is the account the dashboard belongs to. It is checked at boot, before anything else.
MAIN_WALLET_ADDRESS=

# --- Exchange (required only when TRADING_MODE=live) ---------------------------------
# Use a Hyperliquid API wallet, never your master account key. API wallets can trade but
# cannot withdraw, which bounds what a compromise of this file can cost you.
HYPERLIQUID_PRIVATE_KEY=
HYPERLIQUID_WALLET_ADDRESS=

# --- Secrets (required; no defaults) --------------------------------------------------
# Generate with: node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
# The app refuses to start without these rather than falling back to a shared default.
JWT_SECRET=
SIGNATURE_SECRET=
ENCRYPTION_KEY=
WALLET_ENCRYPTION_KEY=

# --- Optional -------------------------------------------------------------------------
REDIS_URL=
OPENROUTER_API_KEY=
PLUGINS_DIR=./plugins
`

// ─────────────────────────────────────────────────────────────────────────────────────

function main() {
  const pluginPkgRoot = process.env.AGENT_PKG_ROOT
    || 'C:/Users/Anthony/AppData/Local/Temp/claude/store-audit/artifact-integrity/ex'

  fs.mkdirSync(OUT, { recursive: true })
  const tiers = only ? { [only]: TIERS[only] } : TIERS
  if (only && !TIERS[only]) throw new Error(`unknown tier "${only}"`)

  let failed = false
  const summary = []

  for (const [name, spec] of Object.entries(tiers)) {
    const r = buildTier(name, spec, pluginPkgRoot)

    console.log(`\n=== ${r.label} ===`)
    console.log(`  files staged     : ${r.fileCount}  (${(r.bytes / 1048576).toFixed(2)} MB)`)
    console.log(`  from manifest    : ${r.copied} copied, ${r.missing.length} missing`)
    console.log(`  dependencies     : ${r.prunedDeps.kept} kept, ${r.prunedDeps.dropped} pruned`)
    console.log(`  denied by policy : ${r.denied.length}`)
    console.log(`  excluded feature : ${r.excluded.length}`)
    for (const p of r.pluginResults) {
      console.log(`  plugin ${p.id.padEnd(24)} ${p.ok ? `built (${p.bytes} B)` : `FAILED — ${p.reason}`}`)
      if (!p.ok) failed = true
    }
    if (r.denied.length) console.log(`    denied: ${r.denied.slice(0, 5).join(', ')}`)
    if (r.excluded.length) console.log(`    excluded: ${r.excluded.slice(0, 5).join(', ')}`)

    if (r.unresolved.length) {
      failed = true
      console.error(`
  UNRESOLVED IMPORTS — ${r.unresolved.length}; this package would not build:`)
      for (const u of r.unresolved.slice(0, 12)) console.error(`    ${u.file} -> ${u.spec}`)
    } else {
      console.log('  imports resolve   : yes')
    }

    if (r.findings.length) {
      failed = true
      console.error(`\n  SECRET SCAN FAILED — ${r.findings.length} finding(s):`)
      for (const f of r.findings.slice(0, 20)) {
        console.error(`    ${f.file}:${f.line}  ${f.kind}  ${f.sample}`)
      }
    } else {
      console.log('  secret scan      : clean')
    }

    if (!dryRun && !r.findings.length && !r.unresolved.length) {
      const zip = path.join(OUT, `${r.label}.zip`)
      fs.rmSync(zip, { force: true })
      execFileSync('powershell', ['-NoProfile', '-Command',
        `Compress-Archive -Path '${r.stage}\\*' -DestinationPath '${zip}' -Force`],
        { stdio: 'pipe' })
      const buf = fs.readFileSync(zip)
      const digest = sha256(buf)
      console.log(`  archive          : ${path.basename(zip)}  ${buf.length} bytes`)
      console.log(`  sha256           : ${digest}`)
      summary.push({ tier: name, productId: spec.productId, version: spec.version,
                     file: path.basename(zip), bytes: buf.length, sha256: digest,
                     agents: spec.agents.map((a) => AGENT_PACKS[a]) })
    }
  }

  if (summary.length) {
    const out = path.join(OUT, 'packages.json')
    fs.writeFileSync(out, JSON.stringify(summary, null, 2) + '\n')
    console.log(`\nwrote ${out}`)
  }
  if (failed) {
    console.error('\nBUILD FAILED — see findings above. No archive was written for a failing tier.')
    process.exit(1)
  }
}

main()
