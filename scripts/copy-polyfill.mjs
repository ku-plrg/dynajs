import { execSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk';

// To use with different ESMETA_HOME: ESMETA_HOME=~/path/to/esmeta npm run copy
const INCLUDE = [
  // Bulk-select with a RegExp, then carve out exceptions in EXCLUDE below, e.g.:
  /^INTRINSICS\.Array(\..*)/,
  /^INTRINSICS\.Array\.prototype\./,

  // /^INTRINSICS\.Boolean\./,
  // /^INTRINSICS\.Function\./,
  // "INTRINSICS.JSON.stringify",
  // /^INTRINSICS\.Map\./,
  // /^INTRINSICS\.Math\.(floor|ceil|round|abs|trunc|max|min|sign)/,
  // /^INTRINSICS\.Number\./,
  // /^INTRINSICS\.Object\./,
  // /^INTRINSICS\.RegExp\./,
  // /^INTRINSICS\.Set\./,
  /^INTRINSICS\.String/,
  /^INTRINSICS\.String\.prototype\./,
  // "RegExpExec",
  // /^INTRINSICS\.RegExp\.prototype\.(exec|test)/,
  'AO__CanonicalNumericIndexString',
  // 'INTRINSICS.JSON.stringify',
];

const EXCLUDE = [
  // /Locale/,
  // match/search are provided as hand-authored symbolic-regex models
  // (INTRINSICS.*.manual.ts -> $.regexOp); keep them out of esmeta extraction
  // (the generated versions delegate to the spec matcher) but DO let their
  // manual shims be barreled, so they are not excluded here.

  // iterator - smelly,
  'INTRINSICS.Array.from',

  /* array iterator */
  'INTRINSICS.Array.prototype.entries',
  'INTRINSICS.Array.prototype.keys',
  'INTRINSICS.Array.prototype.values',
  'INTRINSICS.String.prototype__Symbol.iterator__',
  
  /* implementation defined - host environment dependent */
  'INTRINSICS.Array.prototype.toLocaleString', // esmeta not supported
  'INTRINSICS.String.prototype.toLocaleLowerCase', // esmeta not supported
  'INTRINSICS.String.prototype.toLocaleUpperCase', // esmeta not supported
  'INTRINSICS.String.prototype.localeCompare',

  /* regex */
  'INTRINSICS.String.prototype.match',
  'INTRINSICS.String.prototype.matchAll',
  'INTRINSICS.String.prototype.search',

  /* getter */
  'INTRINSICS.Array.prototype__Symbol.unscopables__',
  'INTRINSICS.String.prototype__Symbol.unscopables__',
];

const NO_CHECK = [
  'AO__IsLessThan', // ok - number and bigint mix
  'AO__ToNumeric', // ok - "number" as string as unknown
  'INTRINSICS.String',
  'INTRINSICS.String.fromCharCode',
  'INTRINSICS.String.fromCodePoint',
  'INTRINSICS.Array.prototype.toSorted',
  'INTRINSICS.Array.prototype.toString',
  'INTRINSICS.String.prototype.fromCharCode',
  'INTRINSICS.String.prototype.fromCodePoint',
  'AO__IteratorClose',
  'AO__IteratorNext',
  'AO__IteratorStep',
  'AO__IteratorStepValue',
  'INTRINSICS.Array.of',
  'INTRINSICS.Array.prototype.sort',  
  'INTRINSICS.Array.prototype.reduce',
  'INTRINSICS.Array.prototype.reduceRight',
  'INTRINSICS.Array.prototype.reverse',
  'AO__FlattenIntoArray',
  'AO__GetSubstitution',
];

const ESMETA_HOME = process.env.ESMETA_HOME;
if (!ESMETA_HOME) {
  console.error(chalk.red('✗ ESMETA_HOME is not set.'));
  process.exit(1);
}

if (INCLUDE.length === 0) {
  console.error(
    chalk.yellow(
      'No files specified. Fill in the INCLUDE array in scripts/copy-polyfill.mjs.',
    ),
  );
  process.exit(1);
}

// A pattern set matcher: exact strings (with optional .ts stripped) or RegExp.
function makeMatcher(patterns) {
  const exact = new Set();
  const regexes = [];
  for (const p of patterns) {
    if (p instanceof RegExp) regexes.push(p);
    else exact.add(p.endsWith('.ts') ? p.slice(0, -3) : p);
  }
  return (name) => exact.has(name) || regexes.some((re) => re.test(name));
}
const isExcluded = makeMatcher(EXCLUDE);
const isNoCheck = makeMatcher(NO_CHECK);

const srcDir = join(ESMETA_HOME, 'logs', 'polyfill');

// Clear stale gen-poly output so a builtin removed or renamed upstream doesn't
// linger and get pulled back in by the dependency walk below.
rmSync(srcDir, { recursive: true, force: true });

// Generate polyfills in ESMETA_HOME first.
console.log(chalk.cyan(`▶ Running gen-poly (${ESMETA_HOME})`));
execSync('sbt "run gen-poly -silent -gen-poly:log"', {
  cwd: ESMETA_HOME,
  stdio: 'inherit',
});

if (!existsSync(srcDir)) {
  console.error(chalk.red(`✗ Source directory not found: ${srcDir}`));
  process.exit(1);
}

const destDir = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'analyses',
  'flow',
  'spec',
);
mkdirSync(destDir, { recursive: true });

// Hand-authored implementations are named `<base>.manual.ts` and tracked in git.
// Map each base to its manual file so the dependency walk knows which builtins
// are provided locally (and must not be fetched from ESMETA).
const MANUAL_SUFFIX = '.manual.ts';
const manualBases = new Map();
for (const entry of readdirSync(destDir)) {
  if (!entry.endsWith(MANUAL_SUFFIX)) continue;
  manualBases.set(entry.slice(0, -MANUAL_SUFFIX.length), entry);
}

// Before copying, clear the generated `.ts` files (shims, copied AOs, barrel) so
// stale output never lingers. Hand-authored `*.manual.ts` and non-.ts files
// (.gitignore, .gitkeep) are left untouched.
for (const entry of readdirSync(destDir)) {
  if (!entry.endsWith('.ts') || entry.endsWith(MANUAL_SUFFIX)) continue;
  rmSync(join(destDir, entry));
}

const AUTO_GEN_WARNING = `// THIS FILE IS AUTO-GENERATED, DO NOT EDIT\n`;

// Emit a thin re-export shim next to every manual file so the rest of the spec
// can keep importing `./AO__Foo.js` without caring whether AO__Foo is generated
// or hand-authored. The shim is regenerated each run; edit the .manual.ts file.
for (const [base, file] of manualBases) {
  if (isExcluded(base)) continue;
  const shim =
    AUTO_GEN_WARNING +
    `export * from "./${base}.manual.js";\n`;
  writeFileSync(join(destDir, `${base}.ts`), shim);
}

// Match relative imports like `from "./AO__StringIndexOf.js"` so we can follow
// each builtin's dependency graph. `@/...` and bare imports are intentionally
// not matched — only sibling spec files need to be copied alongside.
const REL_IMPORT_RE = /\bfrom\s+["']\.\/([^"']+?)\.js["']/g;
function depsOf(content) {
  const out = [];
  for (const m of content.matchAll(REL_IMPORT_RE)) out.push(m[1]);
  return out;
}

const missing = [];
const copiedNames = [];
const visited = new Set();
// Universe of selectable bases for RegExp expansion: every generated polyfill
// plus every manual base. Exact-string INCLUDE entries are added verbatim even
// if absent (so they surface in the missing report below).
const universe = new Set([
  ...readdirSync(srcDir)
    .filter((f) => f.endsWith('.ts'))
    .map((f) => f.slice(0, -3)),
  ...manualBases.keys(),
]);
const roots = new Set();
for (const entry of INCLUDE) {
  if (entry instanceof RegExp) {
    for (const name of universe) if (entry.test(name)) roots.add(name);
  } else {
    roots.add(entry.endsWith('.ts') ? entry.slice(0, -3) : entry);
  }
}
// EXCLUDE wins over INCLUDE.
for (const r of [...roots]) if (isExcluded(r)) roots.delete(r);

// Seed the worklist with the resolved roots and every manual file; transitive
// AO dependencies are discovered and copied below. Manual files resolve to their
// shim (already written), but we still follow their imports to pull in any
// generated AOs they depend on. Only the roots are barreled.
const queue = [...roots];
queue.push(...manualBases.keys());
while (queue.length > 0) {
  const base = queue.shift();
  if (visited.has(base)) continue;
  visited.add(base);
  // EXCLUDE applies to roots and transitive deps alike: skip copying and don't
  // follow this base's own dependencies.
  if (isExcluded(base)) continue;

  let content;
  const manualFile = manualBases.get(base);
  if (manualFile !== undefined) {
    // Provided locally — shim is already written; read the impl for its deps.
    content = readFileSync(join(destDir, manualFile), 'utf8');
    if (roots.has(base)) copiedNames.push(base);
  } else {
    const file = `${base}.ts`;
    const from = join(srcDir, file);
    if (!existsSync(from)) {
      missing.push(file);
      continue;
    }
    content = readFileSync(from, 'utf8');
    if (isNoCheck(base)) content = `// @ts-nocheck\n${content}`;
    writeFileSync(join(destDir, file), content);
    if (roots.has(base)) copiedNames.push(base);
  }

  for (const dep of depsOf(content)) {
    if (!visited.has(dep)) queue.push(dep);
  }
}

if (missing.length > 0) {
  console.error(
    chalk.red(`✗ ${missing.length} file(s) not found:`),
    missing.join(', '),
  );
}

// Generate a barrel that re-exports every emitted module
const barrelBases = readdirSync(destDir)
  .filter(
    (f) => f.endsWith('.ts') && f !== 'index.ts' && !f.endsWith(MANUAL_SUFFIX),
  )
  .map((f) => f.slice(0, -3))
  .sort();
const exportLines = barrelBases.map((base) => {
  return `export * from "./${base}.js";`;
});
const barrel = `${AUTO_GEN_WARNING}${exportLines.join('\n')}\n`;
writeFileSync(join(destDir, 'index.ts'), barrel);

console.log(
  chalk.green(
    `✓ Copied ${copiedNames.length} polyfill file(s) → analyses/flow/spec/`,
  ),
);
console.log(
  chalk.green(
    `✓ Wrote barrel (${barrelBases.length} exports) → analyses/flow/spec/index.ts`,
  ),
);

// Report the emitted artifacts split by provenance (auto-extracted from esmeta
// vs hand-authored *.manual.ts) and kind, so each run shows exactly what landed.
const kindOf = (base) =>
  base.startsWith('INTRINSICS.')
    ? 'INTRINSICS'
    : base.startsWith('AO__')
      ? 'AO__'
      : base.startsWith('SYNTAX__')
        ? 'SYNTAX__'
        : 'other';
const tally = () => ({ INTRINSICS: 0, AO__: 0, SYNTAX__: 0, other: 0, total: 0 });
const auto = tally();
const manual = tally();
let shimCount = 0;
for (const base of manualBases.keys()) {
  manual[kindOf(base)]++;
  manual.total++;
}
for (const base of barrelBases) {
  if (manualBases.has(base)) {
    shimCount++; // re-export shim wrapping a manual impl — not an extracted artifact
    continue;
  }
  auto[kindOf(base)]++;
  auto.total++;
}
const fmt = (c) =>
  `${String(c.total).padStart(3)}  (INTRINSICS ${c.INTRINSICS}, AO__ ${c.AO__}, SYNTAX__ ${c.SYNTAX__}, other ${c.other})`;
console.log(chalk.cyan('\nArtifact summary (analyses/flow/spec/):'));
console.log(chalk.cyan(`  auto-extracted (esmeta gen-poly): ${fmt(auto)}`));
console.log(chalk.cyan(`  manual (*.manual.ts):             ${fmt(manual)}`));
console.log(
  chalk.gray(`  + ${shimCount} re-export shim(s), 1 barrel (index.ts)`),
);

// Warn about dead *.manual.ts files. The main walk seeds EVERY manual base
// unconditionally, so a manual file nothing depends on is still shimmed and
// barreled without complaint. Recompute reachability WITHOUT that blanket seed:
// a manual file earns its keep only if it is an INCLUDE root, a transitive AO
// dependency of one, or referenced by name from framework source outside spec/
// (e.g. flow.ts imports SYNTAX__add, which no INCLUDE root reaches).
function contentForDeps(base) {
  const manualFile = manualBases.get(base);
  if (manualFile !== undefined)
    return readFileSync(join(destDir, manualFile), 'utf8');
  const from = join(srcDir, `${base}.ts`);
  return existsSync(from) ? readFileSync(from, 'utf8') : null;
}
function reachableFrom(start) {
  const seen = new Set();
  const work = [...start];
  while (work.length > 0) {
    const base = work.shift();
    if (seen.has(base)) continue;
    seen.add(base);
    if (isExcluded(base)) continue;
    const content = contentForDeps(base);
    if (content === null) continue;
    for (const dep of depsOf(content)) if (!seen.has(dep)) work.push(dep);
  }
  return seen;
}

// Identifiers used in framework source (the barrel's consumers: anything under
// analyses/flow/ except spec/ itself). A base whose mangled export name
// (dots → underscores) appears there is treated as a reachability root.
function collectFrameworkSource(dir) {
  let text = '';
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'spec') continue; // the barrel re-exports everything
    const full = join(dir, entry.name);
    if (entry.isDirectory()) text += collectFrameworkSource(full);
    else if (entry.name.endsWith('.ts'))
      text += `${readFileSync(full, 'utf8')}\n`;
  }
  return text;
}
const frameworkIdents = new Set(
  collectFrameworkSource(resolve(destDir, '..')).match(
    /[A-Za-z_$][A-Za-z0-9_$]*/g,
  ) ?? [],
);
const frameworkRoots = new Set();
for (const base of universe)
  if (frameworkIdents.has(base.replaceAll('.', '_'))) frameworkRoots.add(base);

const reachable = reachableFrom(new Set([...roots, ...frameworkRoots]));
const unusedManual = [...manualBases.keys()]
  .filter((base) => !isExcluded(base) && !reachable.has(base))
  .sort();
if (unusedManual.length > 0) {
  console.warn(
    chalk.yellow(
      `\n⚠ ${unusedManual.length} unused *.manual.ts (barreled but not reachable from any INCLUDE root or framework import):`,
    ),
  );
  for (const base of unusedManual)
    console.warn(chalk.yellow(`    ${base}.manual.ts`));
}

if (missing.length > 0) process.exit(1);
