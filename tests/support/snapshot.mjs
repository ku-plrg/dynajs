import fs from 'node:fs';
import assert from 'node:assert/strict';

// Set DYNAJS_UPDATE=1 to overwrite mismatching .out files instead of failing.
export const UPDATE =
  process.env.DYNAJS_UPDATE === '1' || process.env.DYNAJS_UPDATE === 'true';

// A fixture may declare a nonzero expected exit code in a sibling `.exit` file
// (e.g. throw-1.exit contains "1"), mirroring the sibling `.out` snapshot
// convention — co-located so it survives moves. Absent means the default, 0.
export function expectedExitCode(absFile) {
  const exitFile = absFile.replace(/\.[^.]+$/, '.exit');
  if (!fs.existsSync(exitFile)) return 0;
  return Number(fs.readFileSync(exitFile, 'utf8').trim());
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
