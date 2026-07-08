import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

// Entry point for `npm test`. It exists only to control `node --test` arg
// order: node ignores flags placed *after* a positional file glob, so caller
// flags (--watch, --test-name-pattern) must go *before* the globs. cwd and
// DYNAJS_HOME are pinned to the repo root (from this file's location, never
// process.cwd()) for git-worktree safety.
const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const GLOBS = ['tests/**/*.test.mjs'];

const argv = yargs(hideBin(process.argv))
  .scriptName('test')
  .usage('$0 [options] — dynajs regression + analysis test suites')
  .option('watch', {
    alias: 'w',
    type: 'boolean',
    describe: 'Re-run the suite on file changes',
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
  .version(false)
  .strict()
  .parseSync();

const nodeArgs = ['--test'];
if (argv.watch) nodeArgs.push('--watch');
if (argv.name) nodeArgs.push(`--test-name-pattern=${argv.name}`);
nodeArgs.push(...GLOBS);

const { status } = spawnSync(process.execPath, nodeArgs, {
  stdio: 'inherit',
  cwd: repoRoot,
  env: {
    ...process.env,
    DYNAJS_HOME: repoRoot,
    ...(argv.update ? { DYNAJS_UPDATE: '1' } : {}),
  },
});

process.exit(status ?? 1);
