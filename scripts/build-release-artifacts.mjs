import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const workspace = process.cwd();
const sourceRoot = path.resolve(process.env.RELEASE_SOURCE_ROOT || 'tmp/release-audit/extracted');
const outputRoot = path.resolve(process.env.RELEASE_OUTPUT_ROOT || 'tmp/release-build');
const stageRoot = path.join(outputRoot, 'staging');
const artifactRoot = path.join(outputRoot, 'artifacts');
const assetsRoot = path.join(workspace, 'release-assets');

const paths = {
  core: path.join(sourceRoot, 'core'),
  meme: path.join(sourceRoot, 'meme'),
  flash: path.join(sourceRoot, 'flash'),
};

for (const [name, source] of Object.entries(paths)) {
  try {
    if (!(await stat(source)).isDirectory()) throw new Error();
  } catch {
    throw new Error(`Missing ${name} release source: ${source}. Run scripts/audit-release-inventory.mjs first or set RELEASE_SOURCE_ROOT.`);
  }
}

await rm(outputRoot, { recursive: true, force: true });
await mkdir(stageRoot, { recursive: true });
await mkdir(artifactRoot, { recursive: true });

const excludedNames = new Set([
  '.git', '.next', '.turbo', 'node_modules', 'coverage', 'dist', 'build',
  'tsconfig.tsbuildinfo', 'typecheck-output.txt', '.DS_Store', 'Thumbs.db',
]);

async function copyReleaseSource(source, destination) {
  await cp(source, destination, {
    recursive: true,
    filter: (candidate) => {
      const name = path.basename(candidate);
      if (excludedNames.has(name)) return false;
      if (name.startsWith('.env') && name !== '.env.example') return false;
      return true;
    },
  });
}

const licence = await readFile(path.join(assetsRoot, 'strategy-pack', 'LICENSE.md'), 'utf8');

async function stageCore() {
  const destination = path.join(stageRoot, 'ai-trading-dashboard-v1.0.1');
  await copyReleaseSource(paths.core, destination);
  await writeFile(path.join(destination, 'LICENSE.md'), licence);
  const readmePath = path.join(destination, 'README.md');
  const readme = await readFile(readmePath, 'utf8');
  const notice = `# Cival Core Edition 1.0.1\n\n> Start in demo, paper, or exchange testnet mode. This is source code, not a managed service or a promise of trading results. Review authentication, database policies, credential handling, order sizing, and emergency controls before enabling live execution.\n\n`;
  await writeFile(readmePath, `${notice}${readme.replaceAll('gwds.app', 'civalsystems.com').replaceAll('support@gwds.app', 'support@civalsystems.com')}`);
  return destination;
}

async function stageStrategyPack() {
  const destination = path.join(stageRoot, 'strategy-pack-v1.0.0');
  await copyReleaseSource(path.join(assetsRoot, 'strategy-pack'), destination);
  await mkdir(path.join(destination, 'src'), { recursive: true });
  let engine = await readFile(path.join(paths.core, 'src', 'lib', 'agents', 'strategy-engine.ts'), 'utf8');
  engine = engine
    .replace(
      "import { Candle, computeAllIndicators, calculateSMA, calculateATR, calculateRSI } from './technical-analysis';",
      "import { computeAllIndicators, calculateSMA, calculateATR, calculateRSI } from './technical-analysis.ts';\nimport type { Candle } from './technical-analysis.ts';",
    )
    // The original calculation included the current candle in its own breakout box,
    // making a close above that same candle's high impossible.
    .replace('const recent = candles.slice(-lookback);', 'const recent = candles.slice(-(lookback + 1), -1);')
    // The original Renko loops compared a constant diff while mutating basePrice,
    // creating an infinite loop as soon as a candle crossed one brick.
    .replaceAll(
      /    const diff = closes\[i\] - basePrice;\r?\n    while \(diff >= brickSize\) \{\r?\n      basePrice \+= brickSize;\r?\n      bricks\.push\(\{ direction: 'up', price: basePrice \}\);\r?\n    \}\r?\n    while \(-diff >= brickSize\) \{\r?\n      basePrice -= brickSize;\r?\n      bricks\.push\(\{ direction: 'down', price: basePrice \}\);\r?\n    \}/g,
      `    let diff = closes[i] - basePrice;\n    while (diff >= brickSize) {\n      basePrice += brickSize;\n      bricks.push({ direction: 'up', price: basePrice });\n      diff = closes[i] - basePrice;\n    }\n    while (diff <= -brickSize) {\n      basePrice -= brickSize;\n      bricks.push({ direction: 'down', price: basePrice });\n      diff = closes[i] - basePrice;\n    }`,
    );
  await writeFile(path.join(destination, 'src', 'strategy-engine.ts'), engine);
  await cp(
    path.join(paths.core, 'src', 'lib', 'agents', 'technical-analysis.ts'),
    path.join(destination, 'src', 'technical-analysis.ts'),
  );
  return destination;
}

async function stageMeme() {
  const destination = path.join(stageRoot, 'meme-trading-suite-v1.0.1');
  await copyReleaseSource(paths.meme, destination);
  await writeFile(path.join(destination, 'LICENSE.md'), licence);
  await writeFile(path.join(destination, '.env.example'), `# Server-only secrets — never prefix these with NEXT_PUBLIC_\nSUPABASE_SERVICE_ROLE_KEY=your-service-role-key\nSOLANA_RPC_URL=https://your-solana-rpc.example\nSOLANA_PRIVATE_KEY=your-dedicated-low-balance-key\nENCRYPTION_KEY=your-32-byte-random-hex-key\n\n# Browser-safe project settings\nNEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co\nNEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key\n\n# Optional providers\nDEXSCREENER_API_KEY=\nHELIUS_API_KEY=\n`);
  await writeFile(path.join(destination, 'package.json'), `${JSON.stringify({
    name: 'cival-meme-trading-suite',
    version: '1.0.1',
    private: true,
    description: 'Cival Core extension source for the nine-tab meme-market workspace.',
    peerDependencies: {
      '@solana/spl-token': '^0.4.0',
      '@solana/web3.js': '^1.98.0',
      '@supabase/supabase-js': '^2.0.0',
      next: '>=15',
      react: '>=19',
    },
  }, null, 2)}\n`);
  const readmePath = path.join(destination, 'README.md');
  const readme = await readFile(readmePath, 'utf8');
  await writeFile(readmePath, `${readme.replaceAll('https://gwds.dev', 'https://www.civalsystems.com')}\n\n## Security and risk\n\nStart with observation and paper workflows. Meme tokens can be illiquid, manipulated, malicious, or worthless. Protect private keys server-side, use a dedicated low-balance wallet, apply row-level security to every tenant table, and independently review all execution paths before enabling live transactions. Filters and confidence scores do not make a token safe.\n`);
  return destination;
}

async function stageFlash() {
  const destination = path.join(stageRoot, 'flash-loan-arbitrage-v1.1.1');
  await copyReleaseSource(paths.flash, destination);
  await writeFile(path.join(destination, 'LICENSE.md'), licence);
  await writeFile(path.join(destination, '.env.example'), `ARBITRUM_RPC_URL=https://your-arbitrum-rpc.example\nFLASH_LOAN_PRIVATE_KEY=your-dedicated-low-balance-key\nFLASH_LOAN_NETWORK=sepolia\nFLASH_LOAN_MIN_PROFIT_USD=1.0\nFLASH_LOAN_MAX_GAS_GWEI=0.5\nFLASH_LOAN_DRY_RUN=true\nFLASH_LOAN_CONTRACT=your-reviewed-contract-address\n`);
  await writeFile(path.join(destination, 'package.json'), `${JSON.stringify({
    name: 'cival-flash-loan-arbitrage-reference',
    version: '1.1.1',
    private: true,
    description: 'Cival Core extension source for Arbitrum flash-loan arbitrage research.',
    peerDependencies: {
      ethers: '^6.0.0',
      next: '>=15',
      react: '>=19',
      recharts: '^2.0.0',
    },
  }, null, 2)}\n`);
  const readmePath = path.join(destination, 'README.md');
  let readme = await readFile(readmePath, 'utf8');
  readme = readme
    .replace('Automated cross-DEX arbitrage using Aave V3 flash loans on Arbitrum. Zero collateral, atomic execution, real-time opportunity detection.', 'Cross-DEX arbitrage reference source using Aave V3 flash-loan mechanics on Arbitrum, with simulation-first controls.')
    .replace('If the trade isn\'t profitable, the entire transaction reverts and you lose nothing but gas.', 'If a transaction reverts, gas and infrastructure costs can still be lost. Quotes, route simulations, and estimated profit can differ from execution.')
    .replace('The only cost of a failed attempt is gas (~$0.50–$3 on Arbitrum). There is no liquidation risk and no collateral requirement.', 'A reverted attempt can still lose gas and incur provider or infrastructure costs. Contract, key, oracle, routing, liquidity, MEV, and implementation risks remain. Use Sepolia and dry-run mode first, and obtain an independent contract security review before mainnet use.');
  await writeFile(readmePath, `${readme}\n\nThis package is source code for research and integration. It is not a turnkey profit system, financial advice, or a guarantee that an observed opportunity can be executed.\n`);
  return destination;
}

function runEvidence(directory, offline) {
  const args = ['--experimental-strip-types', 'scripts/run-backtest.mjs', '--coins', 'BTC,ETH', '--interval', '1h', '--days', '30', '--confidence', '60'];
  if (offline) args.push('--offline');
  execFileSync(process.execPath, args, { cwd: directory, stdio: 'inherit' });
}

async function sha256(file) {
  return createHash('sha256').update(await readFile(file)).digest('hex');
}

async function zipDirectory(directory, filename) {
  const destination = path.join(artifactRoot, filename);
  execFileSync('tar.exe', ['-a', '-c', '-f', destination, '-C', directory, '.'], { stdio: 'inherit' });
  return destination;
}

async function writeBundle(name, nestedArtifacts) {
  const destination = path.join(stageRoot, name);
  await mkdir(path.join(destination, 'releases'), { recursive: true });
  const manifest = [];
  for (const artifact of nestedArtifacts) {
    const target = path.join(destination, 'releases', path.basename(artifact));
    await cp(artifact, target);
    manifest.push({
      file: `releases/${path.basename(artifact)}`,
      bytes: (await stat(artifact)).size,
      sha256: await sha256(artifact),
    });
  }
  await writeFile(path.join(destination, 'LICENSE.md'), licence);
  await writeFile(path.join(destination, '.env.example'), '# Configure each nested release from its own .env.example file.\n');
  await writeFile(path.join(destination, 'package.json'), `${JSON.stringify({
    name,
    version: '1.0.0',
    private: true,
    description: 'Versioned Cival source release bundle. See RELEASE-MANIFEST.json.',
  }, null, 2)}\n`);
  await writeFile(path.join(destination, 'RELEASE-MANIFEST.json'), `${JSON.stringify({ name, generatedAt: new Date().toISOString(), files: manifest }, null, 2)}\n`);
  await writeFile(path.join(destination, 'README.md'), `# ${name.replaceAll('-', ' ')}\n\nThis bundle contains the independently versioned Cival release archives listed in \`RELEASE-MANIFEST.json\`. Verify each SHA-256 digest before extracting. Read every included setup guide, start in demo/paper/testnet mode, and never reuse a wallet or database credential from another environment.\n\nThe software is provided as source code, not a managed investment product or a guarantee of performance.\n`);
  return destination;
}

const coreStage = await stageCore();
const strategyStage = await stageStrategyPack();
const memeStage = await stageMeme();
const flashStage = await stageFlash();

runEvidence(strategyStage, false);
runEvidence(strategyStage, true);

const coreArtifact = await zipDirectory(coreStage, 'ai-trading-dashboard-v1.0.1.zip');
const strategyArtifact = await zipDirectory(strategyStage, 'strategy-pack-v1.0.0.zip');
const memeArtifact = await zipDirectory(memeStage, 'meme-trading-suite-v1.0.1.zip');
const flashArtifact = await zipDirectory(flashStage, 'flash-loan-arbitrage-v1.1.1.zip');

const traderStage = await writeBundle('trader-edition-v1.0.0', [coreArtifact, strategyArtifact]);
const deskStage = await writeBundle('desk-edition-v1.0.0', [coreArtifact, strategyArtifact, memeArtifact, flashArtifact]);
const traderArtifact = await zipDirectory(traderStage, 'trader-edition-v1.0.0.zip');
const deskArtifact = await zipDirectory(deskStage, 'desk-edition-v1.0.0.zip');

const artifacts = [coreArtifact, strategyArtifact, memeArtifact, flashArtifact, traderArtifact, deskArtifact];
const releaseManifest = [];
for (const artifact of artifacts) {
  releaseManifest.push({
    file: path.basename(artifact),
    bytes: (await stat(artifact)).size,
    sha256: await sha256(artifact),
  });
}
await writeFile(path.join(artifactRoot, 'release-manifest.json'), `${JSON.stringify({ generatedAt: new Date().toISOString(), artifacts: releaseManifest }, null, 2)}\n`);

console.log(`Built ${artifacts.length} artifacts in ${artifactRoot}`);
