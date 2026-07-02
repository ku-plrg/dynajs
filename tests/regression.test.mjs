import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { repoRoot } from './support/paths.mjs';
import { iterTestTargets } from './support/discover.mjs';
import { runDynajs } from './support/run.mjs';
import { assertSnapshot, expectedExitCode } from './support/snapshot.mjs';

// Each suite runs one analysis over a directory of targets. A target with a
// sibling .out is checked against that snapshot; every target is checked against
// its expected exit code (default 0, overridden in expected-exit-codes.json).
const SUITES = [
  {
    name: 'trace-all',
    dir: 'tests/regression-trace/trace-all',
    analysis: 'samples/TraceAll.js',
  },
  {
    name: 'compare-some',
    dir: 'tests/regression-trace/compare-some',
    analysis: 'samples/CompareSome.js',
  },
  {
    name: 'hierarchy',
    dir: 'tests/regression-trace/hierarchy',
    analysis: 'samples/HierarchyDemo.js',
  },
  {
    name: 'regression-node/trace-all',
    dir: 'tests/regression-node/trace-all',
    analysis: 'samples/TraceAll.js',
  },
];

for (const suite of SUITES) {
  describe(suite.name, () => {
    const dir = path.join(repoRoot, suite.dir);
    for (const file of iterTestTargets(dir)) {
      const outFile = file.replace(/\.[^.]+$/, '.out');
      const hasSnapshot = fs.existsSync(outFile);
      test(path.relative(dir, file), () => {
        const r = runDynajs(suite.analysis, [file]);
        assert.equal(
          r.status,
          expectedExitCode(file),
          `unexpected exit code\nstdout:\n${r.stdout}\nstderr:\n${r.stderr}`,
        );
        if (hasSnapshot) assertSnapshot(outFile, r.stdout);
      });
    }
  });
}
