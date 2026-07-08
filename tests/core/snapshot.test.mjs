import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { repoRoot } from '../support/paths.mjs';
import { iterTestTargets } from '../support/discover.mjs';
import { runDynajs } from '../support/run.mjs';
import { assertSnapshot, expectedExitCode } from '../support/snapshot.mjs';

// Snapshot regression: the trace an analysis emits must match its golden .out.
// Run in the canonical partial mode only — TraceAll's trace is byte-identical
// under partial and full (it hooks every feature), so a per-mode snapshot would
// just duplicate. A target with a sibling .out is checked against it; every
// target is also held to its expected exit code (default 0, overridden in
// expected-exit-codes.json).
const SUITES = [
  {
    name: 'trace-all',
    dir: 'tests/regression-trace/trace-all',
    analysis: 'examples/simple/TraceAll.js',
  },
  {
    name: 'compare-some',
    dir: 'tests/regression-trace/compare-some',
    analysis: 'examples/simple/CompareSome.js',
  },
  {
    name: 'hierarchy',
    dir: 'tests/regression-trace/hierarchy',
    analysis: 'examples/simple/HierarchyDemo.js',
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
