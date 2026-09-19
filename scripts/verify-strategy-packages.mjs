import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import ts from 'typescript';

// Reproducible, offline candidate compilation. This does not approve an archive
// for sale: the dashboard loader and order lifecycle need separate acceptance.
const root = 'release-assets/strategy-packages';
const results = [];
function finite(value, location = 'signal') {
  if (typeof value === 'number') assert(Number.isFinite(value), `${location} is not finite`);
  else if (value && typeof value === 'object')
    for (const [key, child] of Object.entries(value)) finite(child, `${location}.${key}`);
}
for (const id of fs.readdirSync(root).filter(id => fs.statSync(path.join(root, id)).isDirectory())) {
  const folder = path.join(root, id);
  const entry = path.join(folder, 'src/strategy.ts');
  const program = ts.createProgram([entry], {strict: true, target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.CommonJS, types: [], skipLibCheck: true, outDir: path.join(folder, 'dist')});
  const errors = ts.getPreEmitDiagnostics(program);
  assert.equal(errors.length, 0, ts.formatDiagnosticsWithColorAndContext(errors, {
    getCanonicalFileName: x => x, getCurrentDirectory: () => process.cwd(), getNewLine: () => '\n'}));
  program.emit();
  const manifest = JSON.parse(fs.readFileSync(path.join(folder, 'manifest.json'), 'utf8'));
  const exports = {};
  const ctx = vm.createContext({exports, module: {exports}, console: {log(){},warn(){},error(){}}});
  new vm.Script(fs.readFileSync(path.join(folder, manifest.entryPoint), 'utf8')).runInContext(ctx, {timeout: 2000});
  const strategy = ctx.module.exports.strategy;
  assert.deepEqual(JSON.parse(JSON.stringify(strategy.defaultConfig)), manifest.defaultConfig, `${id}: manifest defaults must match source`);
  const cases = [];
  for (const scenario of ['empty', 'flat', 'rising', 'falling', 'volatile', 'zero-volume', 'spike']) {
    ctx.candles = scenario === 'empty' ? [] : Array.from({length: 240}, (_, i) => {
      const c = scenario === 'rising' ? 100+i*.4 : scenario === 'falling' ? 200-i*.4 : scenario === 'volatile' ? 100+Math.sin(i)*8 : scenario === 'spike' && i === 239 ? 120 : 100;
      return {timestamp: 1700000000000+i*3600000, open: c-.1, high: c+1, low: c-1, close: c, volume: scenario === 'zero-volume' ? 0 : scenario === 'spike' && i === 239 ? 10000000 : 200000+i*100};
    });
    ctx.config = manifest.defaultConfig;
    try {
      const signal = new vm.Script('module.exports.strategy.execute(candles,config)').runInContext(ctx, {timeout: 2000});
      assert(['long','short','neutral'].includes(signal.direction));
      assert(typeof signal.reasoning === 'string' && signal.reasoning.length > 0);
      finite(signal);
      if (signal.direction !== 'neutral') {
        assert(signal.entry > 0 && signal.stopLoss > 0 && signal.takeProfit > 0, 'actionable signal needs protection prices');
        if (signal.direction === 'long') assert(signal.stopLoss < signal.entry && signal.takeProfit > signal.entry);
        else assert(signal.stopLoss > signal.entry && signal.takeProfit < signal.entry);
      }
      cases.push({scenario, direction: signal.direction, passed: true});
    } catch (error) { cases.push({scenario, passed: false, error: error.message}); }
  }
  results.push({id, cases});
}
fs.writeFileSync(path.join(root, 'validation.json'), JSON.stringify({scope: 'Offline compilation and synthetic signal contract checks; no exchange or runtime integration acceptance',results}, null, 2)+'\n');
console.log(JSON.stringify(results, null, 2));
assert(results.every(r => r.cases.every(c => c.passed)), 'Strategy candidate verification failed');
