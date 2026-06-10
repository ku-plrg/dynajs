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

// List of polyfill file names (extension .ts can be omitted).
// To use with different ESMETA_HOME: ESMETA_HOME=~/path/to/esmeta npm run copy
const FILES = [
  // "ToString",
  // "GetSubstitution",
  "INTRINSICS.String.prototype.at",
  "INTRINSICS.String.prototype.charAt",
  // "INTRINSICS.String.prototype.charCodeAt",
  "INTRINSICS.String.prototype.slice",
  "INTRINSICS.String.prototype.concat",
  "INTRINSICS.String.prototype.repeat",

  "INTRINSICS.String.prototype.replace",
  "INTRINSICS.String.prototype.split",
  "INTRINSICS.String.prototype.substring",
];

const ESMETA_HOME = process.env.ESMETA_HOME;
if (!ESMETA_HOME) {
  console.error(chalk.red("✗ ESMETA_HOME is not set."));
  process.exit(1);
}

if (FILES.length === 0) {
  console.error(
    chalk.yellow(
      "No files specified. Fill in the FILES array in scripts/copy-polyfill.mjs.",
    ),
  );
  process.exit(1);
}

// Generate polyfills in ESMETA_HOME first.
console.log(chalk.cyan(`▶ Running gen-poly (${ESMETA_HOME})`));
execSync('sbt "run gen-poly -silent -gen-poly:log"', {
  cwd: ESMETA_HOME,
  stdio: "inherit",
});

const srcDir = join(ESMETA_HOME, "logs", "polyfill");
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
// Seed the worklist with the requested builtins and every manual file; transitive
// AO dependencies are discovered and copied below. Manual files resolve to their
// shim (already written), but we still follow their imports to pull in any
// generated AOs they depend on. Only the requested builtins (roots) are barreled.
const queue = FILES.map((name) => (name.endsWith(".ts") ? name.slice(0, -3) : name));
const roots = new Set(queue);
queue.push(...manualBases.keys());
while (queue.length > 0) {
  const base = queue.shift();
  if (visited.has(base)) continue;
  visited.add(base);

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
    cpSync(from, join(destDir, file));
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

// Generate a barrel that re-exports every requested builtin, so consumers import
// from a single place instead of one path per builtin. Support AOs (generated or
// hand-authored) are imported directly by the builtin files and not re-exported.
// The export name mirrors the generated function name: dots/dashes -> underscores.
const exportLines = copiedNames.map((base) => {
  const symbol = base.replace(/[^A-Za-z0-9]/g, "_");
  return `export { ${symbol} } from "./${base}.js";`;
});
const barrel = `// THIS FILE IS AUTO-GENERATED, DO NOT EDIT\n${exportLines.join("\n")}\n`;
writeFileSync(join(destDir, "index.ts"), barrel);

console.log(
  chalk.green(`✓ Copied ${copiedNames.length} polyfill file(s) → src/model/spec/`),
);
console.log(chalk.green(`✓ Wrote barrel → src/model/spec/index.ts`));
if (missing.length > 0) process.exit(1);
