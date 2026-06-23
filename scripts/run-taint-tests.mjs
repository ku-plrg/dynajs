import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..');
const testRoot = path.join(repoRoot, 'analyses', 'taint', 'test');
const dynajs = path.join(repoRoot, 'dynajs');
const analysis = path.join(repoRoot, 'analyses', 'dist', 'Taint.mjs');

if (!fs.existsSync(analysis)) {
  console.error(
    chalk.red(
      `missing built analysis at ${analysis}. Run \`npm run build\` first.`,
    ),
  );
  process.exit(2);
}

function collect(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter(
      (e) =>
        e.isFile() &&
        e.name.endsWith('.js') &&
        !e.name.endsWith('__dynajs__.js'),
    )
    .map((e) => path.join(dir, e.name))
    .sort();
}

const buckets = [
  { label: 'unit', dir: path.join(testRoot, 'unit'), required: true },
  { label: 'goals', dir: path.join(testRoot, 'goals'), required: false },
];

const env = {
  ...process.env,
  DYNAJS_HOME: repoRoot,
  DYNAJS_OPTIONS: `--analysis=${analysis} --partial --pos persist`,
};

let unitPass = 0;
let unitFail = 0;
let goalAchieved = 0;
let goalPending = 0;
const unitFailures = [];

for (const { label, dir, required } of buckets) {
  const files = collect(dir);
  for (const file of files) {
    const rel = path.relative(repoRoot, file);
    const r = spawnSync(dynajs, ['node', file], { env, encoding: 'utf8' });
    const ok = r.status === 0;
    if (required) {
      if (ok) {
        unitPass++;
        console.log(`${chalk.green('PASS')} [${label}] ${rel}`);
      } else {
        unitFail++;
        unitFailures.push({
          rel,
          label,
          status: r.status,
          stdout: r.stdout,
          stderr: r.stderr,
        });
        console.log(
          `${chalk.red('FAIL')} [${label}] ${rel} (exit ${r.status})`,
        );
      }
    } else {
      if (ok) {
        goalAchieved++;
        console.log(
          `${chalk.cyan('ACHIEVED')} [${label}] ${rel}  ${chalk.gray('(consider moving to test/unit)')}`,
        );
      } else {
        goalPending++;
        console.log(`${chalk.gray('PENDING')}  [${label}] ${rel}`);
      }
    }
  }
}

if (unitFailures.length > 0) {
  console.log();
  for (const f of unitFailures) {
    console.log(chalk.red(`--- ${f.label} ${f.rel} ---`));
    if (f.stdout) console.log(f.stdout.trimEnd());
    if (f.stderr) console.error(f.stderr.trimEnd());
  }
}

console.log();
console.log(`unit:  ${unitPass} passed, ${unitFail} failed`);
console.log(`goals: ${goalAchieved} achieved, ${goalPending} pending`);
process.exit(unitFail === 0 ? 0 : 1);
