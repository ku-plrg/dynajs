import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk';

// Concolic test runner. Unlike the taint runner (exit-code per `__assert__`),
// concolic asserts are SYMBOLIC: `__symbolic_assert__(cond, expected)` solves
// `PC ∧ ¬cond` and prints `@@DJX_VERDICT <actual> <expected>` — actual is the
// engine's verdict (detected = proved valid, clean = falsifiable, error =
// unsolved), expected is the test's ground truth. A file passes when it emits
// at least one verdict and every verdict's actual matches its expected.
//
// Tests live OUTSIDE the shared bench/micro corpus, under
// analyses/concolic/test/{unit,goals}/, so they can evolve freely.

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..');
const testRoot = path.join(repoRoot, 'analyses', 'concolic', 'test');
const dynajs = path.join(repoRoot, 'dynajs');
const analysis = path.join(repoRoot, 'analyses', 'dist', 'Concolic.mjs');

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
  DYNAJS_OPTIONS: `--analysis=${analysis} --partial`,
};

const VERDICT_RE =
  /@@DJX_VERDICT\s+(detected|clean|error)\s+(detected|clean)\b/g;

function runFile(file) {
  const r = spawnSync(dynajs, ['node', file], { env, encoding: 'utf8' });
  const verdicts = [];
  for (const m of (r.stdout ?? '').matchAll(VERDICT_RE)) {
    verdicts.push({ actual: m[1], expected: m[2], ok: m[1] === m[2] });
  }
  const crashed = r.status !== 0;
  const reason = crashed
    ? `crashed (exit ${r.status})`
    : verdicts.length === 0
      ? 'no verdicts emitted'
      : `${verdicts.filter((v) => !v.ok).length}/${verdicts.length} mismatched`;
  const ok = !crashed && verdicts.length > 0 && verdicts.every((v) => v.ok);
  return { ok, reason, verdicts, crashed, stderr: r.stderr };
}

let unitPass = 0;
let unitFail = 0;
let goalAchieved = 0;
let goalPending = 0;
const failures = [];

for (const { label, dir, required } of buckets) {
  for (const file of collect(dir)) {
    const rel = path.relative(repoRoot, file);
    const res = runFile(file);
    const count = chalk.gray(
      `(${res.verdicts.length} assert${res.verdicts.length === 1 ? '' : 's'})`,
    );
    if (required) {
      if (res.ok) {
        unitPass++;
        console.log(`${chalk.green('PASS')} [${label}] ${rel} ${count}`);
      } else {
        unitFail++;
        failures.push({ rel, label, ...res });
        console.log(
          `${chalk.red('FAIL')} [${label}] ${rel} ${chalk.gray(`(${res.reason})`)}`,
        );
      }
    } else if (res.ok) {
      goalAchieved++;
      console.log(
        `${chalk.cyan('ACHIEVED')} [${label}] ${rel} ${count}  ${chalk.gray('(consider moving to test/unit)')}`,
      );
    } else {
      goalPending++;
      console.log(
        `${chalk.gray('PENDING')}  [${label}] ${rel} ${chalk.gray(`(${res.reason})`)}`,
      );
    }
  }
}

if (failures.length > 0) {
  console.log();
  for (const f of failures) {
    console.log(chalk.red(`--- ${f.label} ${f.rel} (${f.reason}) ---`));
    for (const v of f.verdicts) {
      const tag = v.ok ? chalk.green('ok      ') : chalk.red('MISMATCH');
      console.log(`  ${tag} actual=${v.actual} expected=${v.expected}`);
    }
    if (f.crashed && f.stderr) {
      console.error(f.stderr.trimEnd().split('\n').slice(-8).join('\n'));
    }
  }
}

console.log();
console.log(`unit:  ${unitPass} passed, ${unitFail} failed`);
console.log(`goals: ${goalAchieved} achieved, ${goalPending} pending`);
process.exit(unitFail === 0 ? 0 : 1);
