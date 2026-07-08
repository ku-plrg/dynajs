import { before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { repoRoot } from '../support/paths.mjs';
import { iterTestTargets } from '../support/discover.mjs';
import { runDynajs } from '../support/run.mjs';

// Concolic asserts are SYMBOLIC: `__symbolic_assert__(cond, expected)` solves
// `PC ∧ ¬cond` and prints `@@DJX_VERDICT <actual> <expected>` — actual is the
// engine's verdict (detected = proved valid, clean = falsifiable, error =
// unsolved), expected is the test's ground truth. A file passes when it emits
// at least one verdict and every verdict's actual matches its expected. Goals
// run `todo` — not yet guaranteed, never fails the suite.
const testRoot = path.join(repoRoot, 'examples', 'concolic', 'test');
const analysis = 'examples/dist/Concolic.mjs';

const VERDICT_RE = /@@DJX_VERDICT\s+(detected|clean|error)\s+(detected|clean)\b/g;

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
        assert.equal(r.status, 0, `crashed:\n${r.stderr}`);
        const verdicts = [...(r.stdout ?? '').matchAll(VERDICT_RE)].map(
          ([, actual, expected]) => ({ actual, expected }),
        );
        assert.ok(verdicts.length > 0, 'no verdicts emitted');
        for (const v of verdicts) {
          assert.equal(
            v.actual,
            v.expected,
            `verdict mismatch: expected ${v.expected}, got ${v.actual}`,
          );
        }
      });
    }
  });
}
