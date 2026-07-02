import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { repoRoot } from './support/paths.mjs';
import { iterTestTargets } from './support/discover.mjs';
import { runPlainNode, runDynajs } from './support/run.mjs';

// EmptyAnalysis must be transparent: instrumenting a program under it should
// leave exit code and stdout identical to running it under plain Node.
const DIR = path.join(repoRoot, 'tests', 'regression-node', 'empty');
const ANALYSIS = 'samples/EmptyAnalysis.js';

describe('empty', () => {
  for (const file of iterTestTargets(DIR)) {
    test(path.relative(DIR, file), () => {
      const baseline = runPlainNode([file]);
      const result = runDynajs(ANALYSIS, [file]);
      const ctx =
        `plain stderr:\n${baseline.stderr}\n` + `dynajs stderr:\n${result.stderr}`;
      assert.equal(result.status, baseline.status, `exit code differs\n${ctx}`);
      assert.equal(result.stdout, baseline.stdout, `stdout differs\n${ctx}`);
    });
  }
});
