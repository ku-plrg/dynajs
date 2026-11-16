// Bundles for the SWIPE port, all built from src/ (dist/instrument/*.js is stale tsc output):
//   bench/swipe/dist/dynajs-runtime.js   — DynaJS runtime as a classic browser script
//   bench/swipe/dist/instrument.mjs      — Node-side instrumenter used by the harness/proxy
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
const here = (p) => fileURLToPath(new URL(p, import.meta.url));
await build({
  entryPoints: [here('./browser-entry.ts')],
  outfile: here('./dist/dynajs-runtime.js'),
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: 'chrome90',
  alias: { fs: here('./shims/fs.js'), path: here('./shims/path.js') },
  logLevel: 'warning',
});
await build({
  entryPoints: [here('../../src/instrument/main.ts')],
  outfile: here('./dist/instrument.mjs'),
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'node20',
  packages: 'bundle',
  banner: { js: 'import { createRequire } from "node:module"; const require = createRequire(import.meta.url);' },
  logLevel: 'warning',
});
// option B: SWIPE DSE on DynaJS's concolic analysis (browser)
// FlowAnalysis imports node:util (inspect.custom); smt.ts imports node:child_process
// for its z3 driver, which the SWIPE analysis never calls (it only formats SMT)
const nodeShims = {
  'node:util': here('./shims/util.js'),
  'node:child_process': here('./shims/child_process.js'),
};
await build({
  entryPoints: [here('./dse-dynajs/index.ts')],
  outfile: here('./dist/dse-dynajs.js'),
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: 'chrome90',
  alias: nodeShims,
  logLevel: 'warning',
});
// debug variant: same analysis, posting progress to a log server (see TRACE in dse-dynajs/index.ts)
await build({
  entryPoints: [here('./dse-dynajs/index.ts')],
  outfile: here('./dist/dse-dynajs-trace.js'),
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: 'chrome90',
  alias: nodeShims,
  banner: { js: 'var __DYNAJS_TRACE = "http://localhost:8398/";' },
  logLevel: 'warning',
});
console.log('built bench/swipe/dist/{dynajs-runtime.js,instrument.mjs,dse-dynajs.js}');
