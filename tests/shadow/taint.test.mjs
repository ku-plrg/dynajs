import { before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { repoRoot } from '../support/paths.mjs';
import { iterTestTargets } from '../support/discover.mjs';
import { runDynajs } from '../support/run.mjs';

// Taint unit tests assert via exit code: `__assert__` throws (nonzero exit) on
// a failed taint check. Goals are the same shape but not yet guaranteed to
// pass, so they run `todo` — a regression there is visible but never fails
// the suite.
const testRoot = path.join(repoRoot, 'examples', 'taint', 'test');
const analysis = 'examples/dist/Taint.mjs';

before(() => {
  const abs = path.resolve(repoRoot, analysis);
  assert.ok(
    fs.existsSync(abs),
    `missing built analysis at ${abs}. Run \`npm run build\` first.`,
  );
});

const BUCKETS = [
  { name: 'unit', dir: path.join(testRoot, 'unit'), todo: false },
  { name: 'goals', dir: path.join(testRoot, 'goals'), todo: true },
];

for (const { name, dir, todo } of BUCKETS) {
  describe(name, () => {
    for (const file of iterTestTargets(dir)) {
      test(path.relative(dir, file), { todo }, () => {
        const r = runDynajs(analysis, [file]);
        assert.equal(r.status, 0, `stdout:\n${r.stdout}\nstderr:\n${r.stderr}`);
      });
    }
  });
}
