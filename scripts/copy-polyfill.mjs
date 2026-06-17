import { execSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import chalk from "chalk";

// To use with different ESMETA_HOME: ESMETA_HOME=~/path/to/esmeta npm run copy
const INCLUDE = [
  // Bulk-select with a RegExp, then carve out exceptions in EXCLUDE below, e.g.:
  // /^INTRINSICS\.Array\./,
  // /^INTRINSICS\.Array\.prototype\./,
  "INTRINSICS.Array.prototype.at",
  // "INTRINSICS.Array.prototype.pop",
  // "INTRINSICS.Array.prototype.concat",
  // "INTRINSICS.Array.prototype.find",
  "INTRINSICS.Array.prototype.join",
  "INTRINSICS.Array.prototype.map",
  "INTRINSICS.Array.prototype.reduce",
  "INTRINSICS.Array.prototype.reduceRight",
  
  "INTRINSICS.Array.prototype.push",
  // "INTRINSICS.Array.prototype.indexOf",
  // "INTRINSICS.Array.prototype.includes",
  // /^INTRINSICS\.Boolean\./,
  // /^INTRINSICS\.Function\./,
  // /^INTRINSICS\.JSON\./,
  // /^INTRINSICS\.Map\./,
  // /^INTRINSICS\.Math\./,
  // /^INTRINSICS\.Number\./,
  // /^INTRINSICS\.Object\./,
  // /^INTRINSICS\.RegExp\./,
  // /^INTRINSICS\.Set\./,
  // /^INTRINSICS\.String\./,
  /^INTRINSICS\.String\.prototype\./,
];

const EXCLUDE = [
  // /Locale/,
  "INTRINSICS.String.prototype.match",
  "INTRINSICS.String.prototype.matchAll",
  "INTRINSICS.String.prototype.replaceAll",
  "INTRINSICS.String.prototype.search",
];

const NO_CHECK = [
  "INTRINSICS.Array.prototype.reduce",
  "INTRINSICS.Array.prototype.reduceRight",
  "AO__GetSubstitution",
];

const ESMETA_HOME = process.env.ESMETA_HOME;
if (!ESMETA_HOME) {
  console.error(chalk.red("✗ ESMETA_HOME is not set."));
  process.exit(1);
}

if (INCLUDE.length === 0) {
  console.error(
    chalk.yellow(
      "No files specified. Fill in the INCLUDE array in scripts/copy-polyfill.mjs.",
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
    else exact.add(p.endsWith(".ts") ? p.slice(0, -3) : p);
  }
  return (name) => exact.has(name) || regexes.some((re) => re.test(name));
}
const isExcluded = makeMatcher(EXCLUDE);
const isNoCheck = makeMatcher(NO_CHECK);

const srcDir = join(ESMETA_HOME, "logs", "polyfill");

// Clear stale gen-poly output so a builtin removed or renamed upstream doesn't
// linger and get pulled back in by the dependency walk below.
rmSync(srcDir, { recursive: true, force: true });

// Generate polyfills in ESMETA_HOME first.
console.log(chalk.cyan(`▶ Running gen-poly (${ESMETA_HOME})`));
execSync('sbt "run gen-poly -silent -gen-poly:log"', {
  cwd: ESMETA_HOME,
  stdio: "inherit",
});

if (!existsSync(srcDir)) {
  console.error(chalk.red(`✗ Source directory not found: ${srcDir}`));
  process.exit(1);
}

const destDir = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "src",
  "model",
  "spec",
);
mkdirSync(destDir, { recursive: true });

// Hand-authored implementations are named `<base>.manual.ts` and tracked in git.
// Map each base to its manual file so the dependency walk knows which builtins
// are provided locally (and must not be fetched from ESMETA).
const MANUAL_SUFFIX = ".manual.ts";
const manualBases = new Map();
for (const entry of readdirSync(destDir)) {
  if (!entry.endsWith(MANUAL_SUFFIX)) continue;
  manualBases.set(entry.slice(0, -MANUAL_SUFFIX.length), entry);
}

// Before copying, clear the generated `.ts` files (shims, copied AOs, barrel) so
// stale output never lingers. Hand-authored `*.manual.ts` and non-.ts files
// (.gitignore, .gitkeep) are left untouched.
for (const entry of readdirSync(destDir)) {
  if (!entry.endsWith(".ts") || entry.endsWith(MANUAL_SUFFIX)) continue;
  rmSync(join(destDir, entry));
}

// Emit a thin re-export shim next to every manual file so the rest of the spec
// can keep importing `./AO__Foo.js` without caring whether AO__Foo is generated
// or hand-authored. The shim is regenerated each run; edit the .manual.ts file.
for (const [base, file] of manualBases) {
  if (isExcluded(base)) continue;
  const shim =
    `// THIS FILE IS AUTO-GENERATED, DO NOT EDIT\n` +
    `// Re-exports the hand-authored implementation in ${file}.\n` +
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
    .filter((f) => f.endsWith(".ts"))
    .map((f) => f.slice(0, -3)),
  ...manualBases.keys(),
]);
const roots = new Set();
for (const entry of INCLUDE) {
  if (entry instanceof RegExp) {
    for (const name of universe) if (entry.test(name)) roots.add(name);
  } else {
    roots.add(entry.endsWith(".ts") ? entry.slice(0, -3) : entry);
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
    content = readFileSync(join(destDir, manualFile), "utf8");
    if (roots.has(base)) copiedNames.push(base);
  } else {
    const file = `${base}.ts`;
    const from = join(srcDir, file);
    if (!existsSync(from)) {
      missing.push(file);
      continue;
    }
    content = readFileSync(from, "utf8");
    if (isNoCheck(base)) writeFileSync(join(destDir, file), `// @ts-nocheck\n${content}`);
    else cpSync(from, join(destDir, file));
    if (roots.has(base)) copiedNames.push(base);
  }

  for (const dep of depsOf(content)) {
    if (!visited.has(dep)) queue.push(dep);
  }
}

if (missing.length > 0) {
  console.error(
    chalk.red(`✗ ${missing.length} file(s) not found:`),
    missing.join(", "),
  );
}

// Generate a barrel that re-exports every emitted module
const barrelBases = readdirSync(destDir)
  .filter((f) => f.endsWith(".ts") && f !== "index.ts" && !f.endsWith(MANUAL_SUFFIX))
  .map((f) => f.slice(0, -3))
  .sort();
const exportLines = barrelBases.map((base) => {
  const symbol = base.replace(/[^A-Za-z0-9]/g, "_");
  return `export { ${symbol} } from "./${base}.js";`;
});
const barrel = `// THIS FILE IS AUTO-GENERATED, DO NOT EDIT\n${exportLines.join("\n")}\n`;
writeFileSync(join(destDir, "index.ts"), barrel);

console.log(
  chalk.green(`✓ Copied ${copiedNames.length} polyfill file(s) → src/model/spec/`),
);
console.log(chalk.green(`✓ Wrote barrel (${barrelBases.length} exports) → src/model/spec/index.ts`));
if (missing.length > 0) process.exit(1);
