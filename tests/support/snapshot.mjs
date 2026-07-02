import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { repoRoot } from './paths.mjs';

// Set DYNAJS_UPDATE=1 to overwrite mismatching .out files instead of failing.
export const UPDATE =
  process.env.DYNAJS_UPDATE === '1' || process.env.DYNAJS_UPDATE === 'true';

const EXIT_CODES_PATH = path.join(repoRoot, 'tests', 'expected-exit-codes.json');

let expectedExitCodes;
export function expectedExitCode(absFile) {
  expectedExitCodes ??= JSON.parse(fs.readFileSync(EXIT_CODES_PATH, 'utf8'));
  return expectedExitCodes[path.relative(repoRoot, absFile)] ?? 0;
}

// Compare trimmed stdout to the sibling .out snapshot. Under UPDATE, rewrite it.
export function assertSnapshot(outFile, actual) {
  const trimmed = (actual ?? '').trim();
  const expected = fs.readFileSync(outFile, 'utf8').trim();
  if (trimmed === expected) return;
  if (UPDATE) {
    fs.writeFileSync(outFile, trimmed + '\n');
    return;
  }
  assert.equal(trimmed, expected);
}
