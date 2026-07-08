import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { repoRoot } from '../support/paths.mjs';
import { iterTestTargets } from '../support/discover.mjs';
import { runDynajs } from '../support/run.mjs';
import { assertSnapshot, expectedExitCode } from '../support/snapshot.mjs';

// Snapshot: the output a demo analysis emits must match its golden .out. Unlike
// the differential suite, this tests the ANALYSES in examples/simple/, not the
// engine. Run in the canonical partial mode only — TraceAll's trace is
// byte-identical under partial and full (it hooks every feature), so a per-mode
// snapshot would just duplicate. A target with a sibling .out is checked against
// it; every target is also held to its expected exit code (default 0, overridden
// by a sibling `.exit` file, e.g. throw-1.exit contains "1").
const SUITES = [
  {
    name: 'trace-all',
    dir: 'tests/analyses/simple/trace-all',
    analysis: 'examples/simple/TraceAll.js',
  },
  {
    name: 'compare-some',
    dir: 'tests/analyses/simple/compare-some',
    analysis: 'examples/simple/CompareSome.js',
  },
  {
    name: 'hierarchy',
    dir: 'tests/analyses/simple/hierarchy',
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
