#!/usr/bin/env node
// microbench composition report.
//
// Reads the `// @target` and `// @feature` headers of every bench under
// bench/micro (the same first-token-only classification the runner uses) and
// prints a matrix of bench counts: rows = @target, columns = @feature, with
// row/column totals. With the current benches this is the es5|es6+ ×
// syntax|builtin 2x2, but it scales to whatever values are present.
//
// Usage: node bench/micro-composition.mjs
//   (or `npm run microstats`)

import { readdirSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BENCH_DIR = path.join(REPO_ROOT, "bench/micro");

// Same header semantics as run-micro-benchmark.mjs: only benches with an
// @oracle are counted; @target/@feature classify by their FIRST token, with a
// missing tag falling into "(none)".
function parseHeader(file) {
  const head = readFileSync(file, "utf8").slice(0, 2048);
  if (!/@oracle\s+(true|false)\b/i.test(head)) return null;
  const tg = head.match(/@target\s+([A-Za-z0-9_+.-]+)/i);
  const ft = head.match(/@feature\s+([A-Za-z0-9_-]+)/i);
  return {
    target: tg ? tg[1].toLowerCase() : "(none)",
    feature: ft ? ft[1].toLowerCase() : "(none)",
  };
}

// Sort keys alphabetically but keep "(none)" last so it reads as a remainder.
const orderKeys = (set) =>
  [...set].sort((a, b) =>
    a === "(none)" ? 1 : b === "(none)" ? -1 : a.localeCompare(b),
  );

function main() {
  if (!existsSync(BENCH_DIR)) {
    console.error(`error: no benchmark dir: ${BENCH_DIR}`);
    process.exit(1);
  }

  // counts[target][feature] = n
  const counts = {};
  const targets = new Set();
  const features = new Set();
  let total = 0;

  const files = readdirSync(BENCH_DIR)
    .filter((f) => f.endsWith(".js") && !f.endsWith("__dynajs__.js"))
    .sort();
  for (const f of files) {
    const meta = parseHeader(path.join(BENCH_DIR, f));
    if (!meta) continue; // no @oracle: not a scored bench
    targets.add(meta.target);
    features.add(meta.feature);
    (counts[meta.target] ??= {})[meta.feature] =
      (counts[meta.target]?.[meta.feature] ?? 0) + 1;
    total++;
  }

  if (!total) {
    console.error("no benchmarks with an @oracle header found");
    process.exit(1);
  }

  const rows = orderKeys(targets);
  const cols = orderKeys(features);
  const cell = (t, f) => counts[t]?.[f] ?? 0;
  const colTotal = (f) => rows.reduce((s, t) => s + cell(t, f), 0);
  const rowTotal = (t) => cols.reduce((s, f) => s + cell(t, f), 0);

  // Column width fits the widest header / number; row-label width fits targets.
  const colW = Math.max(7, ...cols.map((c) => c.length + 2), 5);
  const labelW = Math.max(6, ...rows.map((r) => r.length)) + 2;
  const padNum = (n) => String(n).padStart(colW);
  const padCol = (s) => s.padStart(colW);

  console.log(`\nmicrobench composition (${total} benches)\n`);
  console.log(" ".repeat(labelW) + cols.map(padCol).join("") + padCol("total"));
  for (const t of rows)
    console.log(
      ("  " + t).padEnd(labelW) +
        cols.map((f) => padNum(cell(t, f))).join("") +
        padNum(rowTotal(t)),
    );
  console.log(
    "  total".padEnd(labelW) +
      cols.map((f) => padNum(colTotal(f))).join("") +
      padNum(total),
  );
  console.log();
}

main();
