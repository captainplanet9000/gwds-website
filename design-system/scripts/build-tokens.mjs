#!/usr/bin/env node
// Build tokens.css and tokens.ts from tokens.json.
//
// Why this exists: tokens.json is the single source of truth. Designers or
// AI tools that consume W3C Design Tokens should be able to edit the JSON
// and run `node design-system/scripts/build-tokens.mjs` to regenerate the
// CSS + TS emissions, keeping every surface in sync.
//
// Usage:
//   node design-system/scripts/build-tokens.mjs            # writes tokens.css + tokens.ts
//   node design-system/scripts/build-tokens.mjs --check    # fails if outputs drift (CI)

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const TOKENS_PATH = join(ROOT, 'tokens.json')
const CSS_PATH = join(ROOT, 'tokens.css')
const TS_PATH = join(ROOT, 'tokens.ts')

const tokens = JSON.parse(readFileSync(TOKENS_PATH, 'utf8'))

// Flatten a nested token object into `{ path: '.'-joined, value, type }` rows.
function walk(node, path = []) {
  const rows = []
  if (node && typeof node === 'object' && '$value' in node) {
    rows.push({ path, value: node.$value, type: node.$type, mobile: node.$mobile })
    return rows
  }
  for (const [key, child] of Object.entries(node || {})) {
    if (key.startsWith('$')) continue
    rows.push(...walk(child, [...path, key]))
  }
  return rows
}

const rows = walk(tokens)

// ---- CSS emission (--gwds-<snake-case>) ----------------------------------
function toSnake(path) {
  return path.join('-').replace(/_/g, '-').toLowerCase()
}

function cssValue(row) {
  if (typeof row.value === 'string' && row.value.includes('{')) {
    // {token.ref} -> var(--gwds-token-ref)
    return row.value.replace(/\{([^}]+)\}/g, (_, ref) => `var(--gwds-${ref.replace(/\./g, '-').replace(/_/g, '-')})`)
  }
  return row.value
}

const cssLines = [
  '/* AUTO-GENERATED — edit tokens.json and run `node design-system/scripts/build-tokens.mjs`. */',
  ':root {',
]
for (const row of rows) {
  cssLines.push(`  --gwds-${toSnake(row.path)}: ${cssValue(row)};`)
}
cssLines.push('}', '')

// ---- TS emission ---------------------------------------------------------
function camel(path) {
  return path
    .map((p, i) => (i === 0 ? p : p[0].toUpperCase() + p.slice(1)))
    .join('')
    .replace(/_/g, '')
}

function buildNested(rows) {
  const tree = {}
  for (const row of rows) {
    let cur = tree
    for (let i = 0; i < row.path.length - 1; i++) {
      const seg = row.path[i]
      cur[seg] = cur[seg] || {}
      cur = cur[seg]
    }
    cur[row.path[row.path.length - 1]] = row.value
  }
  return tree
}

const nested = buildNested(rows)
const tsLines = [
  '// AUTO-GENERATED — edit tokens.json and run `node design-system/scripts/build-tokens.mjs`.',
  'export const tokens = ' + JSON.stringify(nested, null, 2) + ' as const',
  '',
  'export type Tokens = typeof tokens',
  '',
]

// ---- Write / check -------------------------------------------------------
const cssOut = cssLines.join('\n')
const tsOut = tsLines.join('\n')

const check = process.argv.includes('--check')

function exists(path, content) {
  try {
    return readFileSync(path, 'utf8') === content
  } catch { return false }
}

if (check) {
  const ok = exists(CSS_PATH, cssOut) && exists(TS_PATH, tsOut)
  if (!ok) {
    console.error('Token drift detected — run `node design-system/scripts/build-tokens.mjs` and commit the result.')
    process.exit(1)
  }
  console.log('Tokens in sync.')
  process.exit(0)
}

writeFileSync(CSS_PATH, cssOut)
writeFileSync(TS_PATH, tsOut)
console.log(`Wrote ${rows.length} tokens to tokens.css and tokens.ts.`)
