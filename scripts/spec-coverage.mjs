#!/usr/bin/env node
// Report how much of analyses/flow/spec was auto-extracted from esmeta vs.
// hand-authored. A spec entry has base name B; it is a MANUAL shim when a
// sibling `B.manual.ts` exists (the generated `B.ts` is then just a re-export),
// and AUTO otherwise. INTRINSICS (built-in functions) are broken down by
// category (Array, String, ...); the whole spec/ dir is summarized by group.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk';

const SPEC_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../analyses/flow/spec',
);

// Number of built-in functions in the ECMAScript spec, per category (hand-set).
// auto% is reported as auto-extracted / this universe — i.e. how much of the
// whole built-in surface dynajs models automatically — rather than auto /
// modeled-subset. The TOTAL row uses the sum. A category left at 0 (or absent)
// has no universe set yet and shows auto% as '-'.
const TOTAL_BUILTINS = {
  String: 53,
  Array: 42,
  Math: NaN,
  RegExp: NaN,
  JSON: NaN,
};

// Which group a spec file belongs to (null = not a spec definition we count).
function groupOf(base) {
  if (base.startsWith('INTRINSICS.')) return 'INTRINSICS';
  if (base.startsWith('AO__')) return 'AO (abstract ops)';
  if (base.startsWith('SYNTAX__')) return 'SYNTAX';
  if (base.startsWith('Number__') || base.startsWith('BigInt__')) return 'Number/BigInt ops';
  return null;
}

// INTRINSICS.Array.prototype.map -> Array
function intrinsicCategory(base) {
  return base.split('.')[1];
}

// Collect base names, marking those backed by a hand-authored *.manual.ts.
function collectEntries(dir) {
  const manual = new Set();
  const all = new Set();
  for (const name of fs.readdirSync(dir)) {
    if (!name.endsWith('.ts')) continue;
    if (name.endsWith('.manual.ts')) {
      const base = name.slice(0, -'.manual.ts'.length);
      manual.add(base);
      all.add(base);
    } else {
      all.add(name.slice(0, -'.ts'.length));
    }
  }
  return [...all].map((base) => ({ base, auto: !manual.has(base) }));
}

function tally(entries) {
  const auto = entries.filter((e) => e.auto).length;
  return { auto, manual: entries.length - auto, total: entries.length };
}

function pctOf(auto, total) {
  return total === 0 ? '-' : `${((100 * auto) / total).toFixed(2)}%`;
}

function pct(t) {
  return pctOf(t.auto, t.total);
}

// Per-category extraction data, using the hand-set built-in universe
// (TOTAL_BUILTINS) as the denominator for auto%. `spec` is the universe count
// (built-ins defined by the ECMAScript spec); `modeled` is auto+manual (the
// subset that has spec files) — the two need not be equal. Iterates the union
// of categories present in spec/ and those declared in TOTAL_BUILTINS, so a
// declared category with no models yet still shows up (0 auto / N). A category
// not declared in TOTAL_BUILTINS falls back to its modeled count as the basis.
function intrinsicCategoryData(byCategory) {
  const cats = new Set([...byCategory.keys(), ...Object.keys(TOTAL_BUILTINS)]);
  const rows = [...cats].map((cat) => {
    const t = tally(byCategory.get(cat) ?? []);
    const declared = Object.prototype.hasOwnProperty.call(TOTAL_BUILTINS, cat);
    const spec = declared ? TOTAL_BUILTINS[cat] : t.total;
    return { category: cat, auto: t.auto, manual: t.manual, modeled: t.total, spec };
  });
  rows.sort((a, b) => b.modeled - a.modeled || a.category.localeCompare(b.category));
  const total = rows.reduce(
    (acc, r) => ({
      auto: acc.auto + r.auto,
      manual: acc.manual + r.manual,
      modeled: acc.modeled + r.modeled,
      spec: acc.spec + r.spec,
    }),
    { auto: 0, manual: 0, modeled: 0, spec: 0 },
  );
  return { rows, total };
}

function bucketBy(entries, keyOf) {
  const map = new Map();
  for (const e of entries) {
    const k = keyOf(e.base);
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(e);
  }
  return map;
}

const COL_W = 10;

function printTable(title, labelHead, rows, totalHead = 'total') {
  const labelW = Math.max(labelHead.length, ...rows.map((r) => r.label.length));
  const cell = (s) => String(s).padStart(COL_W);
  // `supported` (= auto + manual, what dynajs models) is shown just left of the
  // total/spec column when rows carry it.
  const hasSupported = rows.some((r) => r.supported !== undefined);
  const sup = (r) => (hasSupported ? cell(r) : '');
  const cols = hasSupported ? 5 : 4;
  console.log(chalk.bold(`\n${title}`));
  console.log(
    `${labelHead.padEnd(labelW)}${cell('auto')}${cell('manual')}${sup('supported')}${cell(totalHead)}${cell('auto%')}`,
  );
  console.log('-'.repeat(labelW + COL_W * cols));
  for (const r of rows) {
    const line = `${r.label.padEnd(labelW)}${cell(r.auto)}${cell(r.manual)}${sup(r.supported)}${cell(r.total)}${cell(r.pct)}`;
    console.log(r.bold ? chalk.bold(line) : line);
  }
}

function main() {
  const args = process.argv.slice(2);
  const asJson = args.includes('--json');
  const showList = args.includes('--list');

  const entries = collectEntries(SPEC_DIR);
  const intrinsics = entries.filter((e) => e.base.startsWith('INTRINSICS.'));

  const byCategory = bucketBy(intrinsics, intrinsicCategory);
  const byGroup = bucketBy(entries.filter((e) => groupOf(e.base)), (b) => groupOf(b));
  const intr = intrinsicCategoryData(byCategory);

  if (asJson) {
    const withPct = (r) => ({ ...r, autoPct: r.spec === 0 ? null : Number(((100 * r.auto) / r.spec).toFixed(2)) });
    const dump = (map, keyName) =>
      [...map].sort((a, b) => a[0].localeCompare(b[0])).map(([k, es]) => ({
        [keyName]: k,
        ...tally(es),
      }));
    console.log(
      JSON.stringify(
        {
          intrinsicsByCategory: intr.rows.map(withPct),
          intrinsicsTotal: withPct(intr.total),
          specByGroup: dump(byGroup, 'group'),
          specTotal: tally(entries.filter((e) => groupOf(e.base))),
        },
        null,
        2,
      ),
    );
    return;
  }

  // INTRINSICS by category — auto% is auto-extracted / built-ins in the spec.
  const catRows = intr.rows.map((r) => ({
    label: r.category,
    auto: r.auto,
    manual: r.manual,
    supported: r.modeled,
    total: r.spec,
    pct: pctOf(r.auto, r.spec),
  }));
  catRows.push({
    label: 'TOTAL',
    auto: intr.total.auto,
    manual: intr.total.manual,
    supported: intr.total.modeled,
    total: intr.total.spec,
    pct: pctOf(intr.total.auto, intr.total.spec),
    bold: true,
  });
  printTable('INTRINSICS (built-ins) — auto-extraction by category', 'Category', catRows, 'spec');

  // Whole spec/ by group
  const groupRows = [...byGroup]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([g, es]) => {
      const t = tally(es);
      return { label: g, auto: t.auto, manual: t.manual, total: t.total, pct: pct(t) };
    });
  const specEntries = entries.filter((e) => groupOf(e.base));
  const specTotal = tally(specEntries);
  groupRows.push({
    label: 'TOTAL (spec/)',
    auto: specTotal.auto,
    manual: specTotal.manual,
    total: specTotal.total,
    pct: pct(specTotal),
    bold: true,
  });
  printTable('Whole spec/ — auto-extraction by group', 'Group', groupRows);

  if (showList) {
    console.log(chalk.bold('\nManual shims (backed by *.manual.ts)'));
    for (const [cat, es] of [...byCategory].sort((a, b) => a[0].localeCompare(b[0]))) {
      const man = es.filter((e) => !e.auto);
      if (man.length === 0) continue;
      console.log(chalk.dim(`  [${cat}] (${man.length})`));
      for (const e of man.sort((a, b) => a.base.localeCompare(b.base))) {
        console.log(`    - ${e.base.slice('INTRINSICS.'.length)}`);
      }
    }
  }
}

main();
