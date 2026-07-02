import ts from 'typescript';
import { load } from './program.js';
import { constHookMap } from './gate.js';
import { loadGetters } from './extract/getters.js';
import { loadInvokes } from './extract/invokes.js';
import { generateGetters } from './generate/getters.js';

const L = load(process.argv[2] || process.cwd());
const constHook = constHookMap(L);
const emitHook = (n: ts.Node): string | null =>
  ts.isPropertyAccessExpression(n) &&
  ts.isIdentifier(n.expression) &&
  n.expression.text === 'LOG' &&
  constHook.has(n.name.text)
    ? constHook.get(n.name.text)!
    : null;

const { universe, req, shape } = loadGetters(L);
const { fires } = loadInvokes(L, universe);
const { getterCallbacks, stateGatedHooks } = generateGetters(L, emitHook, fires, req);

const eq = (a: Set<string>, b: Set<string>) =>
  a.size === b.size && [...a].every((x) => b.has(x));

console.log('## GENERATED getter(callbacks) vs current src/partial.ts (coverage closure)\n');
const getters = [...new Set([...getterCallbacks.keys()])].sort();
let same = 0;
const deltas: string[] = [];
for (const g of getters) {
  const gen = getterCallbacks.get(g) ?? new Set<string>();
  const cur = req.get(g) ?? new Set<string>();
  if (eq(gen, cur)) {
    same++;
    continue;
  }
  const added = [...gen].filter((c) => !cur.has(c)).sort();
  const removed = [...cur].filter((c) => !gen.has(c)).sort();
  deltas.push(
    `   ~ ${g}:` +
      (added.length ? `  +${added.join(',')}` : '') +
      (removed.length ? `  -${removed.join(',')}` : ''),
  );
}
console.log(`   ${same} getter(s) reproduced exactly.`);
if (deltas.length) {
  console.log('\n   deltas (generated-correct vs current hand — these ARE the P1/P2 fixes):');
  deltas.forEach((d) => console.log(d));
}

// delegating (`return this.F`) and always-on (`return true`) getters are emitted
// trivially from their shape; only PRIMARY getters not reproduced here are real
// gaps needing the state closure (e.g. shouldWrapThrow).
const coverageGetters = new Set(getters);
const delegating = [...req.keys()].filter((g) => shape.get(g) === 'delegating').sort();
const alwaysOnG = [...req.keys()].filter((g) => shape.get(g) === 'always-on').sort();
const primaryGaps = [...req.keys()]
  .filter((g) => shape.get(g) === 'primary' && !coverageGetters.has(g))
  .sort();
console.log(`\n   delegating getters (emit \`return this.<primary>\`): ${delegating.join(', ')}`);
console.log(`   always-on getters (emit \`return true\`): ${alwaysOnG.join(', ')}`);
console.log(`   PRIMARY gaps needing the state closure: ${primaryGaps.join(', ') || '(none)'}`);

// show one concrete generated getter body
const sample = 'G';
if (getterCallbacks.has(sample)) {
  const body = [...getterCallbacks.get(sample)!].sort().map((c) => `this.callbackHint.${c}`).join(' ||\n      ');
  console.log(`\n## sample emitted code — get ${sample}()\n`);
  console.log(`  get ${sample}() {\n    return (\n      ${body}\n    );\n  }`);
}
