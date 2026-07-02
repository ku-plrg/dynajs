import ts from 'typescript';
import { load } from './program.js';
import { constHookMap } from './gate.js';
import { BoolDomain } from './domain/lattice.js';
import { interGate } from './solve/inter.js';
import { loadGetters } from './extract/getters.js';
import { loadInvokes } from './extract/invokes.js';
import { coverage } from './check/coverage.js';
import { checkState } from './check/state.js';

const L = load(process.argv[2] || process.cwd());
const d = new BoolDomain();

// LOG.<CONST> -> hook short name
const constHook = constHookMap(L);
const emitHook = (n: ts.Node): string | null =>
  ts.isPropertyAccessExpression(n) &&
  ts.isIdentifier(n.expression) &&
  n.expression.text === 'LOG' &&
  constHook.has(n.name.text)
    ? constHook.get(n.name.text)!
    : null;

// substrate
const gate = interGate(L, d, emitHook, ['/instrument/write.ts', '/instrument/visitor.ts']);
const { universe, req } = loadGetters(L);
const { fires, hooks } = loadInvokes(L, universe);

let errors = 0;

// SYNC: every hook exported from hooks.ts must have a derived gate (emit site)
const unmapped = hooks.filter((h) => !gate.has(h));
console.log('## SYNC');
if (unmapped.length) {
  errors += unmapped.length;
  console.log(`   ✗ hooks with no emit site found: ${unmapped.join(', ')}`);
} else {
  console.log(`   ✓ all ${hooks.length} hooks.ts hooks have a derived gate`);
}

// P1 coverage
console.log('\n## P1 COVERAGE — callbacks that silently miss events in partial mode');
const findings = coverage(d, gate, req, fires);
if (!findings.length) console.log('   (none)');
for (const f of findings) {
  errors++;
  const carriers = f.carriers
    .map((c) => `${c.hook}${c.via.includes('self') ? '' : '→' + c.via.join('/')}`)
    .sort()
    .join(', ');
  console.log(`   ✗ ${f.callback.padEnd(20)} via [${carriers}]`);
}

// P2 shared-state invariants
console.log('\n## P2 STATE INVARIANTS (@dynajs-meta protocols)');
const st = checkState(L, d, gate, req, universe, hooks);
for (const e of st.metaErrors) { errors++; console.log(`   ✗ META: ${e}`); }
for (const r of st.rows) console.log(`   ${r}`);
for (const f of st.findings) { errors++; console.log(`   ✗ ${f}`); }

console.log(`\n=== ${findings.length} P1 + ${st.findings.length} P2 + ${st.metaErrors.length} meta + ${unmapped.length} sync ===`);
process.exit(errors ? 1 : 0);
