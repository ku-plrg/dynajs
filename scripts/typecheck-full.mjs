import { execSync } from 'node:child_process';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk';

// Temporarily strip the `// @ts-nocheck` that copy-polyfill.mjs adds to NO_CHECK
// files, run tsc, then restore — so suppressed errors can be inspected on demand.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const NOCHECK_RE = /^\/\/ @ts-nocheck[^\n]*\n/m;

function findNoCheck(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) findNoCheck(p, out);
    else if (e.name.endsWith('.ts') && NOCHECK_RE.test(readFileSync(p, 'utf8')))
      out.push(p);
  }
  return out;
}

const originals = new Map(
  findNoCheck(join(root, 'analyses', 'flow', 'spec')).map((f) => [
    f,
    readFileSync(f, 'utf8'),
  ]),
);
console.log(
  chalk.cyan(`▶ Forcing type-check on ${originals.size} @ts-nocheck file(s)`),
);

let failed = false;
try {
  for (const [f, c] of originals) writeFileSync(f, c.replace(NOCHECK_RE, ''));
  // The NO_CHECK files are the generated spec polyfills under analyses/flow/spec,
  // which the analyses tsconfig includes.
  try {
    execSync('npx tsc -p ./analyses/tsconfig.json', {
      cwd: root,
      stdio: 'inherit',
    });
  } catch {
    failed = true;
  }
} finally {
  for (const [f, c] of originals) writeFileSync(f, c);
}

if (failed) {
  console.log(
    chalk.yellow(
      '✗ errors above are suppressed by // @ts-nocheck during a normal build',
    ),
  );
  process.exit(1);
}
console.log(chalk.green('✓ no errors even with // @ts-nocheck stripped'));
