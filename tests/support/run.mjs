import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { repoRoot, dynajsBin, harnessPath } from './paths.mjs';

// Run a target under plain Node with the assert/print harness preloaded — the
// baseline the EmptyAnalysis differential test compares dynajs against.
export function runPlainNode(args, { env: extraEnv = {}, ...opts } = {}) {
  return spawnSync('node', ['--require', harnessPath, ...args.map(String)], {
    encoding: 'utf8',
    cwd: repoRoot,
    ...opts,
    env: { ...process.env, ...extraEnv },
  });
}

// Run a target through the dynajs wrapper under the given analysis. Mirrors the
// old conftest fixture: DYNAJS_HOME/DYNAJS_OPTIONS are always set from repoRoot
// (this tool is directory-sensitive — the instrumentation gate keys off cwd and
// the wrapper's --import path off DYNAJS_HOME), and cwd is pinned to repoRoot so
// targets stay inside the instrumented include root regardless of caller cwd.
export function runDynajs(
  analysis,
  args,
  { mode = 'partial', env: extraEnv = {}, ...opts } = {},
) {
  const options = [
    `--analysis=${path.resolve(repoRoot, analysis)}`,
    '--pos',
    'persist',
    mode === 'partial' ? '--partial' : '--full',
  ];
  const existing = process.env.DYNAJS_OPTIONS;
  const dynajsOptions = (existing ? [existing, ...options] : options).join(' ');

  return spawnSync(dynajsBin, ['node', ...args.map(String)], {
    encoding: 'utf8',
    cwd: repoRoot,
    ...opts,
    env: {
      ...process.env,
      ...extraEnv,
      DYNAJS_HOME: repoRoot,
      DYNAJS_OPTIONS: dynajsOptions,
    },
  });
}
