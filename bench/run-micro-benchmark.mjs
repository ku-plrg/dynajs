#!/usr/bin/env node
// Micro-benchmark + detection-quality runner.
//
// For every bench under bench/micro, this:
//   1. parses the file header for ground truth  (`// @oracle true|false`)
//      and an optional kind tag                 (`// @type taint`)
//   2. runs it under each available runner (plain node, dynajs, external
//      analyzers you wire up), repeating for timing (min/mean ms)
//   3. reads each runner's verdict from a stdout marker the analyzer prints:
//          @@DJX_VERDICT detected      (property holds — positive)
//          @@DJX_VERDICT clean         (ran fine, found nothing — negative)
//      No marker / crash / timeout => `error`.
//   4. builds a confusion matrix per runner and reports precision / recall.
//
// Scoring (per the chosen design):
//   oracle=true (positive):  detected -> TP    clean|error -> FN
//   oracle=false (negative): clean    -> TN    detected|error -> FP
// i.e. a crash or timeout counts against the analyzer (FN on positives, FP on
// negatives); the raw error/timeout counts are also surfaced separately.
//
// Usage:
//   node bench/run-micro-benchmark.mjs [options]
//   --runner NAME     run only the named runner (repeatable)
//   --bench NAME      run only benchmarks matching NAME or NAME.js (repeatable)
//   --analysis NAME   analysis dynajs runs with (default: samples/EmptyAnalysis.js)
//   --reps N          measured iterations per (runner, bench)   (default: 10)
//   --warmup N        discarded warmup iterations               (default: 2)
//   --timeout N       per-run timeout in seconds                (default: 30)
//   --output-dir DIR  write logs and CSV into DIR
//   --help

import { spawnSync } from "node:child_process";
import {
  existsSync, mkdirSync, readdirSync, readFileSync,
  writeFileSync, appendFileSync, accessSync, constants,
} from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BENCH_DIR = path.join(REPO_ROOT, "bench/micro");

// Preloaded by the `baseline` runner: stubs the taint prelude globals
// (`__set_taint__`/`__print_if_tainted__`) to no-ops so a bench runs as plain
// JS under stock node. Without it the bench throws `__set_taint__ is not
// defined` on the first line, and baseline would clock crash time instead of
// the program's actual execution time.
const BASELINE_IMPORT = pathToFileURL(
  path.join(REPO_ROOT, "bench/microbench-import-helper.mjs"),
).href;

// Marker the analyzer must print so we can tell detected from clean.
const VERDICT_RE = /@@DJX_VERDICT\s+(detected|clean)\b/g;

// Per-`@type` dynajs configuration. A bench tagged `// @type taint` runs under
// the analysis + flags listed here — no need to pass them on the CLI.
// `analysis` is resolved relative to the repo root. Add a row per analysis kind.
// `--analysis` / `--dynajs-flags` on the CLI override this for every bench.
const TYPE_CONFIG = {
  taint: { analysis: "analyses/dist/Taint.mjs", flags: "--partial --pos persist" },
  concolic: { analysis: "analyses/dist/Concolic.mjs", flags: "--partial" },
};

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function die(msg) {
  console.error(`error: ${msg}`);
  process.exit(1);
}

const stripExt = (s) => s.replace(/\.(c?js)$/, "");

// Is `cmd` an executable on PATH? (used by external-analyzer runners)
function onPath(cmd) {
  if (cmd.includes(path.sep)) {
    try { accessSync(cmd, constants.X_OK); return true; } catch { return false; }
  }
  for (const dir of (process.env.PATH ?? "").split(path.delimiter)) {
    if (!dir) continue;
    try { accessSync(path.join(dir, cmd), constants.X_OK); return true; } catch { /* keep looking */ }
  }
  return false;
}

// Ground truth + kind from the file header. Returns null if no @oracle.
//   @oracle  true|false   ground truth (required)
//   @type    NAME         dynajs config kind, e.g. taint (see TYPE_CONFIG)
//   @target  es5|es6+ ...     language level the bench exercises
//   @feature syntax|builtin ...   syntactic construct vs. builtin/library behavior
// @target/@feature classify by their FIRST token only; any further
// space-separated tokens are free-form notes (e.g. `@feature syntax binary-add`)
// and are ignored for grouping. Missing tags fall into the "(none)" group.
function parseOracle(file) {
  const head = readFileSync(file, "utf8").slice(0, 2048);
  const o = head.match(/@oracle\s+(true|false)\b/i);
  if (!o) return null;
  const t = head.match(/@type\s+([A-Za-z0-9_-]+)/);
  const tg = head.match(/@target\s+([A-Za-z0-9_+.-]+)/i);
  const ft = head.match(/@feature\s+([A-Za-z0-9_-]+)/i);
  return {
    oracle: o[1].toLowerCase() === "true",
    type: t ? t[1] : "",
    target: tg ? tg[1].toLowerCase() : "", // first token only; rest are notes
    feature: ft ? ft[1].toLowerCase() : "", // first token only; rest are notes
  };
}

// Run one iteration. Returns { code, ms, timedOut, stdout, stderr }, also
// writing stdout/stderr to the given files (null = discard).
function timeRun(argv, env, stdoutFile, stderrFile, timeoutMs) {
  const start = process.hrtime.bigint();
  const r = spawnSync(argv[0], argv.slice(1), {
    cwd: REPO_ROOT,
    env: { ...process.env, ...env },
    encoding: "utf8",
    timeout: timeoutMs,
    killSignal: "SIGKILL",
    maxBuffer: 64 * 1024 * 1024,
  });
  const ms = Number(process.hrtime.bigint() - start) / 1e6;
  const stdout = r.stdout ?? "";
  const stderr = r.stderr ?? "";
  if (stdoutFile) writeFileSync(stdoutFile, stdout);
  if (stderrFile) writeFileSync(stderrFile, stderr);
  return {
    code: r.status ?? -1,
    ms,
    timedOut: r.error != null && r.error.code === "ETIMEDOUT",
    stdout,
    stderr,
  };
}

// Default verdict: parse the @@DJX_VERDICT marker the analyzer prints.
// 'error' when the run timed out or no marker was emitted.
function parseVerdict(run) {
  if (run.timedOut) return "error";
  const text = `${run.stdout}\n${run.stderr}`;
  let m, last = null;
  VERDICT_RE.lastIndex = 0;
  while ((m = VERDICT_RE.exec(text))) last = m[1];
  return last ?? "error";
}

// oracle (true=positive/false=negative) x verdict -> TP|FP|FN|TN
function classify(oracle, verdict) {
  if (oracle) return verdict === "detected" ? "TP" : "FN"; // clean|error -> FN
  return verdict === "clean" ? "TN" : "FP"; //               detected|error -> FP
}

const ratio = (num, den) => (den === 0 ? null : num / den);
const fmtRatio = (x) => (x === null ? "  n/a" : x.toFixed(3));

// ANSI coloring, disabled when not a TTY or under NO_COLOR so piped output and
// the CSV stay clean. TP/TN read as "got it right" -> green; FP/FN as "got it
// wrong" -> red.
const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const color = (code, s) => (useColor ? `\x1b[${code}m${s}\x1b[0m` : s);
const green = (s) => color("32", s);
const red = (s) => color("31", s);
const colorResult = (result, text) =>
  result === "TP" || result === "TN" ? green(text) : red(text);

// Confusion matrix over a list of per-bench records ({ result, verdict,
// anyTimeout, mean }). Used for the overall table and each grouped slice.
function buildMatrix(recs) {
  const m = { TP: 0, FP: 0, FN: 0, TN: 0, err: 0, timeout: 0, meanSum: 0, n: 0 };
  for (const rec of recs) {
    m[rec.result]++;
    if (rec.verdict === "error") m.err++;
    if (rec.anyTimeout) m.timeout++;
    m.meanSum += rec.mean;
    m.n++;
  }
  return m;
}

// One confusion-matrix row: `label` then TP/FP/FN/TN/err/t-o, precision,
// recall, F1, mean_ms. Shared by the overall table and the grouped breakdowns.
function matrixRow(label, m) {
  const precision = ratio(m.TP, m.TP + m.FP);
  const recall = ratio(m.TP, m.TP + m.FN);
  const f1 =
    precision === null || recall === null || precision + recall === 0
      ? null
      : (2 * precision * recall) / (precision + recall);
  return (
    label.padEnd(22) +
    green(String(m.TP).padStart(5)) + red(String(m.FP).padStart(5)) +
    red(String(m.FN).padStart(5)) + green(String(m.TN).padStart(5)) +
    [m.err, m.timeout].map((x) => String(x).padStart(5)).join("") +
    fmtRatio(precision).padStart(11) + fmtRatio(recall).padStart(9) +
    fmtRatio(f1).padStart(8) +
    (m.n ? (m.meanSum / m.n).toFixed(1) : "0").padStart(10)
  );
}

const matrixHeader = (lead) =>
  lead.padEnd(22) +
  green("TP".padStart(5)) + red("FP".padStart(5)) +
  red("FN".padStart(5)) + green("TN".padStart(5)) +
  ["err", "t/o"].map((h) => h.padStart(5)).join("") +
  "precision".padStart(11) + "recall".padStart(9) + "F1".padStart(8) + "mean_ms".padStart(10);

// Resolve dynajs analysis + flags for a bench: a CLI override wins, otherwise
// the bench's `@type` selects a row from TYPE_CONFIG. Returns null if neither.
function resolveDynajs(bench, opts) {
  const analysis = opts.analysis ?? TYPE_CONFIG[bench.type]?.analysis;
  if (!analysis) return null;
  const flags = opts.dynajsFlags ?? TYPE_CONFIG[bench.type]?.flags ?? "";
  return { analysis: path.isAbsolute(analysis) ? analysis : path.join(REPO_ROOT, analysis), flags };
}

// ---------------------------------------------------------------------------
// runners
//
// Each runner: { name, available(), exec(bench, out, err, timeoutMs), applies?, verdict? }
//   - exec(bench, ...) gets the bench object ({ file, name, type, oracle });
//     it returns the timeRun() result object.
//   - applies(bench) -> bool: skip this bench for this runner (default true).
//   - verdict(run) -> 'detected'|'clean'|'error'. Defaults to parseVerdict,
//     which reads the @@DJX_VERDICT stdout marker. Override only for an
//     external analyzer whose native output you'd rather parse directly.
// A runner whose available() is false is skipped with a notice.
// ---------------------------------------------------------------------------

function makeRunners(opts) {
  return [
    {
      // plain Node, no instrumentation: a pure-execution-time reference. The
      // taint prelude globals are stubbed to no-ops via BASELINE_IMPORT so the
      // bench runs as plain JS instead of crashing on the first `__set_taint__`
      // call. It never emits a verdict marker, so it always lands in `error` ->
      // a useful sanity floor for the matrix; only its mean_ms is meaningful.
      name: "baseline",
      available: () => onPath("node"),
      exec: (b, out, err, t) =>
        timeRun(["node", "--import", BASELINE_IMPORT, b.file], {}, out, err, t),
    },
    {
      // this project's analyzer. Analysis + flags are picked per bench from its
      // `@type` (see TYPE_CONFIG), unless overridden by --analysis/--dynajs-flags.
      // The chosen analysis must print `@@DJX_VERDICT detected|clean` (e.g. the
      // taint prelude's __print_if_tainted__); otherwise every run reads as error.
      name: "dynajs",
      available: () => existsSync(path.join(REPO_ROOT, "dynajs")),
      applies: (b) => resolveDynajs(b, opts) != null,
      exec: (b, out, err, t) => {
        const { analysis, flags } = resolveDynajs(b, opts);
        return timeRun(
          [path.join(REPO_ROOT, "dynajs"), "node", b.file],
          {
            DYNAJS_HOME: process.env.DYNAJS_HOME ?? REPO_ROOT,
            DYNAJS_OPTIONS: `--analysis=${analysis}${flags ? " " + flags : ""}`,
          },
          out, err, t,
        );
      },
    },

    // --- external analyzers: fill these in ---------------------------------
    {
      // TODO(you): set the binary name and complete the invocation. Make the
      // tool (or a thin adapter) print `@@DJX_VERDICT detected|clean`; if you
      // can't, add a `verdict(run)` here that maps its native output instead.
      // Use applies:(b)=>b.type==="taint" to restrict it to a kind of bench.
      name: "analyzerA",
      available: () => onPath("analyzerA"),
      exec: (b, out, err, t) => {
        // return timeRun(["analyzerA", "--flags", b.file], {}, out, err, t);
        die("analyzerA runner not implemented");
      },
      // verdict: (run) => /VULNERABLE/.test(run.stdout) ? "detected" : "clean",
    },
    {
      // TODO(you): second external analyzer.
      name: "analyzerB",
      available: () => onPath("analyzerB"),
      exec: (b, out, err, t) => {
        die("analyzerB runner not implemented");
      },
    },
    // -----------------------------------------------------------------------
  ];
}

// ---------------------------------------------------------------------------
// args
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const opts = {
    analysis: null, // override; default analysis comes from each bench's @type
    dynajsFlags: null, // override; default flags come from each bench's @type
    reps: 10,
    warmup: 2,
    timeoutSec: 30,
    outputDir: null,
    runnerFilters: [],
    benchFilters: [],
  };
  const need = (i, flag) => {
    if (i + 1 >= argv.length) die(`${flag} requires a value`);
    return argv[i + 1];
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    switch (a) {
      case "--runner": opts.runnerFilters.push(need(i, a)); i++; break;
      case "--bench": opts.benchFilters.push(need(i, a)); i++; break;
      case "--analysis": opts.analysis = need(i, a); i++; break;
      case "--dynajs-flags": opts.dynajsFlags = need(i, a); i++; break;
      case "--reps": opts.reps = Number(need(i, a)); i++; break;
      case "--warmup": opts.warmup = Number(need(i, a)); i++; break;
      case "--timeout": opts.timeoutSec = Number(need(i, a)); i++; break;
      case "--output-dir": opts.outputDir = need(i, a); i++; break;
      case "--help":
        console.log(
          "Usage: node bench/run-micro-benchmark.mjs " +
            "[--runner NAME] [--bench NAME] [--analysis NAME] [--dynajs-flags STR] " +
            "[--reps N] [--warmup N] [--timeout SEC] [--output-dir DIR]",
        );
        process.exit(0);
      default: die(`unknown option: ${a}`);
    }
  }
  return opts;
}

const matchesAny = (value, filters) =>
  filters.some((f) => value === f || stripExt(value) === stripExt(f));

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const timeoutMs = opts.timeoutSec * 1000;

  if (!existsSync(BENCH_DIR)) die(`no benchmark dir: ${BENCH_DIR}`);

  // Collect benches with a parseable @oracle; warn and skip the rest.
  let benches = [];
  const benchFiles = readdirSync(BENCH_DIR)
    .filter((f) => f.endsWith(".js") && !f.endsWith("__dynajs__.js"))
    .sort();
  for (const f of benchFiles) {
    const file = path.join(BENCH_DIR, f);
    const meta = parseOracle(file);
    if (!meta) {
      console.error(`skip ${f} (no \`// @oracle true|false\` header)`);
      continue;
    }
    benches.push({ file, name: stripExt(f), ...meta });
  }
  if (opts.benchFilters.length)
    benches = benches.filter((b) => matchesAny(path.basename(b.file), opts.benchFilters));
  if (!benches.length) die("no benchmarks with an @oracle header matched");

  let runners = makeRunners(opts);
  if (opts.runnerFilters.length)
    runners = runners.filter((r) => matchesAny(r.name, opts.runnerFilters));
  if (!runners.length) die("no runners matched the requested filters");

  const active = [];
  for (const r of runners) {
    if (r.available()) active.push(r);
    else console.error(`skip runner ${r.name} (not available on PATH)`);
  }
  if (!active.length) die("no runners available");

  const ts = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14);
  const outputDir = opts.outputDir ?? path.join(REPO_ROOT, "bench/results", `micro-${ts}`);
  const logsDir = path.join(outputDir, "logs");
  mkdirSync(logsDir, { recursive: true });
  const csvFile = path.join(outputDir, "results.csv");
  writeFileSync(csvFile, "runner,benchmark,type,target,feature,oracle,rep,verdict,result,exit_code,timed_out,elapsed_ms\n");

  const nPos = benches.filter((b) => b.oracle).length;
  console.log(`Output directory: ${outputDir}`);
  console.log(`Runners: ${active.map((r) => r.name).join(", ")}`);
  console.log(
    `Benchmarks: ${benches.length} (${nPos} positive / ${benches.length - nPos} negative)` +
      `   reps: ${opts.reps}   warmup: ${opts.warmup}   timeout: ${opts.timeoutSec}s\n`,
  );
  console.log(
    "runner".padEnd(12) + "benchmark".padEnd(24) + "oracle".padEnd(8) +
      "verdict".padEnd(10) + "result".padStart(7) + "mean_ms".padStart(10),
  );

  // Per-bench outcomes, kept so the report can slice them any number of ways
  // (overall, by @target, by @feature). records[runner] = [{ bench, result,
  // verdict, anyTimeout, mean }, ...].
  const records = {};
  for (const r of active) records[r.name] = [];

  for (const r of active) {
    const verdictOf = r.verdict ?? parseVerdict;
    for (const b of benches) {
      if (r.applies && !r.applies(b)) {
        console.error(`skip ${r.name}/${b.name} (no config for @type ${b.type || "(none)"})`);
        continue;
      }
      for (let w = 0; w < opts.warmup; w++) r.exec(b, null, null, timeoutMs);

      const samples = [];
      const verdicts = [];
      let anyTimeout = false;
      for (let rep = 1; rep <= opts.reps; rep++) {
        const prefix = `${r.name}__${b.name}__rep${rep}`;
        const run = r.exec(
          b,
          path.join(logsDir, `${prefix}.stdout`),
          path.join(logsDir, `${prefix}.stderr`),
          timeoutMs,
        );
        const v = verdictOf(run);
        samples.push(run.ms);
        verdicts.push(v);
        if (run.timedOut) anyTimeout = true;
        appendFileSync(
          csvFile,
          `${r.name},${b.name},${b.type},${b.target},${b.feature},${b.oracle},${rep},${v},,${run.code},${run.timedOut},${run.ms.toFixed(1)}\n`,
        );
      }

      // Verdict should be deterministic across reps; warn if not, use rep 1.
      const verdict = verdicts[0];
      if (verdicts.some((v) => v !== verdict))
        console.error(`warn ${r.name}/${b.name}: inconsistent verdict across reps: ${verdicts.join(",")}`);

      const result = classify(b.oracle, verdict);
      const mean = samples.reduce((a, c) => a + c, 0) / samples.length;
      records[r.name].push({ bench: b, result, verdict, anyTimeout, mean });

      console.log(
        r.name.padEnd(12) + b.name.padEnd(24) +
          (b.oracle ? "pos" : "neg").padEnd(8) + verdict.padEnd(10) +
          colorResult(result, result.padStart(7)) + mean.toFixed(1).padStart(10),
      );
    }
  }

  console.log("\nConfusion matrix & precision/recall (errors counted as FN/FP):");
  console.log(matrixHeader("runner"));
  for (const r of active) console.log(matrixRow(r.name, buildMatrix(records[r.name])));

  // Same matrix sliced by classification dimension. For each runner we group
  // its records by @target (then @feature, then @type) and print a sub-row per
  // value, so you can read off detection quality on, e.g., es5 vs es6+ benches.
  for (const [dim, label] of [["target", "@target"], ["feature", "@feature"], ["type", "@type"]]) {
    console.log(`\nBy ${label}:`);
    console.log(matrixHeader("runner / " + label));
    for (const r of active) {
      const groups = new Map();
      for (const rec of records[r.name]) {
        const key = rec.bench[dim] || "(none)";
        (groups.get(key) ?? groups.set(key, []).get(key)).push(rec);
      }
      for (const key of [...groups.keys()].sort())
        console.log(matrixRow(`  ${r.name} / ${key}`, buildMatrix(groups.get(key))));
    }
  }

  console.log(`\nCSV: ${csvFile}`);
}

main();