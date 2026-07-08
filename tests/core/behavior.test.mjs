import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { repoRoot } from '../support/paths.mjs';
import { iterTestTargets } from '../support/discover.mjs';
import { runPlainNode, runDynajs } from '../support/run.mjs';

// Behavior regression: instrumenting a program must not change what it does, so
// dynajs output is compared against plain Node (the oracle). A silent analysis
// (EmptyAnalysis) lets us compare full stdout; a noisy one (TraceAll writes its
// trace to stdout) can only be held to exit-code parity. Both run in partial AND
// full mode — full instruments every feature, so it is the stronger transparency
// guarantee and the mode where breakage is most likely to surface.
const MODES = ['partial', 'full'];

const SUITES = [
  {
    name: 'empty',
    dir: 'tests/core/regression-node/empty',
    analysis: 'examples/simple/EmptyAnalysis.js',
    compareStdout: true,
  },
  {
    name: 'trace-all',
    dir: 'tests/core/regression-node/trace-all',
    analysis: 'examples/simple/TraceAll.js',
    compareStdout: false,
  },
];

for (const suite of SUITES) {
  const dir = path.join(repoRoot, suite.dir);
  for (const mode of MODES) {
    describe(`${suite.name} (${mode})`, () => {
      for (const file of iterTestTargets(dir)) {
        test(path.relative(dir, file), () => {
          const baseline = runPlainNode([file]);
          const result = runDynajs(suite.analysis, [file], { mode });
          const ctx = `plain stderr:\n${baseline.stderr}\ndynajs stderr:\n${result.stderr}`;
          assert.equal(result.status, baseline.status, `exit code differs\n${ctx}`);
          if (suite.compareStdout) {
            assert.equal(result.stdout, baseline.stdout, `stdout differs\n${ctx}`);
          }
        });
      }
    });
  }
}
