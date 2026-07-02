import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

// Single entry point for the test suites. Every `test:*` package script routes
// through here as `npm run test -- <flags>`, so the `pretest` build hook runs
// once for all of them and this file owns all option parsing.
//
// It also lets us control `node --test` arg order: node ignores flags placed
// *after* a positional file glob, so caller flags (--watch, --test-name-pattern)
// must go *before* the globs. cwd and DYNAJS_HOME are pinned to the repo root
// (from this file's location, never process.cwd()) for git-worktree safety.
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const GLOBS = ['tests/**/*.test.mjs'];

const argv = yargs(hideBin(process.argv))
  .scriptName('test')
  .usage('$0 [options] — dynajs regression + analysis test suites')
  .option('watch', {
    alias: 'w',
    type: 'boolean',
    describe: 'Re-run the regression suite on file changes',
  })
  .option('update', {
    alias: 'u',
    type: 'boolean',
    describe: 'Overwrite mismatching .out snapshots instead of failing',
  })
  .option('name', {
    alias: 'n',
    type: 'string',
    describe: 'Only run tests whose name matches this pattern',
  })
  .option('taint', { type: 'boolean', describe: 'Run the taint analysis suite' })
  .option('concolic', {
    type: 'boolean',
    describe: 'Run the concolic analysis suite',
  })
  .option('all', {
    type: 'boolean',
    describe: 'Run the regression suite plus taint and concolic',
  })
  .conflicts('watch', ['taint', 'concolic', 'all'])
  .version(false)
  .strict()
  .parseSync();

const wantTaint = Boolean(argv.taint || argv.all);
const wantConcolic = Boolean(argv.concolic || argv.all);
const wantRegression = Boolean(argv.all || (!argv.taint && !argv.concolic));

const run = (args, extraEnv = {}) =>
  spawnSync(process.execPath, args, {
    stdio: 'inherit',
    cwd: repoRoot,
    env: { ...process.env, DYNAJS_HOME: repoRoot, ...extraEnv },
  }).status ?? 1;

let failed = 0;

if (wantRegression) {
  const nodeArgs = ['--test'];
  if (argv.watch) nodeArgs.push('--watch');
  if (argv.name) nodeArgs.push(`--test-name-pattern=${argv.name}`);
  nodeArgs.push(...GLOBS);
  failed |= run(nodeArgs, argv.update ? { DYNAJS_UPDATE: '1' } : {});
}
if (wantTaint) failed |= run([path.join(repoRoot, 'scripts', 'run-taint-tests.mjs')]);
if (wantConcolic) {
  failed |= run([path.join(repoRoot, 'scripts', 'run-concolic-tests.mjs')]);
}

process.exit(failed ? 1 : 0);
