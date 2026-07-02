// Enforces the dynajs core <-> analyses layering:
//   - analyses/** may reach into core only through the public barrel src/index.ts
//   - src/** (core) may never import analysis code
// This is a stopgap until the layers become real packages (@dynajs/core, @dynajs/flow),
// at which point package `exports` maps enforce the same thing and this can be deleted.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC_DIR = join(ROOT, 'src');
const ANALYSES_DIR = join(ROOT, 'analyses');
const BARREL = join(SRC_DIR, 'index'); // extension-agnostic

const SPEC_RE = [
  /\bfrom\s*['"]([^'"]+)['"]/g, // import ... from '...' / export ... from '...'
  /\bimport\s*['"]([^'"]+)['"]/g, // bare side-effect import '...'
  /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g, // dynamic import('...')
];

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    if (name === 'dist' || name === 'node_modules') continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) yield* walk(full);
    else if (/\.m?ts$/.test(name)) yield full;
  }
}

function specifiers(text) {
  const found = [];
  for (const re of SPEC_RE) {
    for (const m of text.matchAll(re)) {
      const line = text.slice(0, m.index).split('\n').length;
      found.push({ spec: m[1], line });
    }
  }
  return found;
}

const stripExt = (p) => p.replace(/\.(m?[jt]s)$/, '');

const violations = [];
const check = (dir, isViolation) => {
  for (const file of walk(dir)) {
    const text = readFileSync(file, 'utf8');
    for (const { spec, line } of specifiers(text)) {
      if (!spec.startsWith('.')) continue; // ignore bare/package specifiers
      const target = resolve(dirname(file), spec);
      const msg = isViolation(target);
      if (msg) violations.push({ file: relative(ROOT, file), line, spec, msg });
    }
  }
};

// analyses/** -> core: barrel only
check(ANALYSES_DIR, (target) => {
  if (!target.startsWith(`${SRC_DIR}/`)) return null;
  if (stripExt(target) === BARREL) return null;
  return `reaches into core internals; import from 'src/index.js' instead`;
});

// src/** (core) -> analyses: never
check(SRC_DIR, (target) =>
  target.startsWith(`${ANALYSES_DIR}/`)
    ? 'core must not import analysis code'
    : null,
);

if (violations.length === 0) {
  console.log(chalk.green('✓ layer boundaries clean'));
  process.exit(0);
}

console.error(chalk.red(`✗ ${violations.length} layer-boundary violation(s):`));
for (const v of violations) {
  console.error(
    `  ${chalk.cyan(`${v.file}:${v.line}`)}  ${chalk.yellow(v.spec)}\n    ${v.msg}`,
  );
}
process.exit(1);
