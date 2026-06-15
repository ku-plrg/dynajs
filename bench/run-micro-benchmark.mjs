#!/usr/bin/env node
// Micro-benchmark + detection-quality runner.
//
// For every bench under bench/micro, this:
//   1. parses the file header for its kind tag (`// @type taint`) and the
//      optional `@target`/`@feature` classification tags. There is no file-level
//      oracle: ground truth lives per-assert (see step 3).
//   2. runs it under each available runner (plain node, dynajs, external
//      analyzers you wire up), repeating for timing (min/mean ms)
//   3. reads the runner's per-assert verdict markers. Each assert
//      (`__symbolic_assert__(cond, expected)` / `__assert_taint__(v, expected)`)
//      prints one marker carrying its actual outcome AND its ground truth:
//          @@DJX_VERDICT <detected|clean|error> <detected|clean>
//      where the 2nd token is what that assert expected. A file may chain
//      several asserts; each marker is one independently-scored case. A run that
//      emits no marker at all (crash/timeout before any assert) is one `error`.
//   4. builds a confusion matrix per runner (counting cases, not files) and
//      reports precision / recall.
//
// Scoring (per case, from its marker's expected token):
//   expected=detected (positive): detected -> TP    clean|error -> FN
//   expected=clean    (negative): clean    -> TN    detected|error -> FP
// A concolic assert z3 can't solve prints `error`, classified FN/FP by expected;
// the raw error/timeout counts are also surfaced separately.
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
//   --update-snapshot (re)write the committed correctness baseline (dynajs only)
//   --check           compare this run to the committed baseline; exit 1 on drift
//   --help
//
// Snapshot modes gate on the verdict only (not timing): they default to 1 rep /
// 0 warmup and to the snapshotted runners (see SNAPSHOT_RUNNERS), so `--check`
// runs fast in CI and needs no external analyzer installed.

import { spawnSync } from "node:child_process";
import {
  existsSync, mkdirSync, readdirSync, readFileSync,
  writeFileSync, appendFileSync, accessSync, constants,
} from "node:fs";
import path from "node:path";
import { homedir, tmpdir } from "node:os";
import { fileURLToPath, pathToFileURL } from "node:url";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BENCH_DIR = path.join(REPO_ROOT, "bench/micro");

// Committed correctness baseline (--update-snapshot writes it, --check compares
// against it). Only the runners listed here are snapshotted: `dynajs` is the
// engine we own and the only one whose verdict is deterministic in CI; the
// external analyzers (expose/nodemedic-jalangi) depend on out-of-tree installs
// ($EXPOSE_HOME/$NODEMEDIC_HOME) and aren't gated. Timing is deliberately NOT
// recorded — mean_ms is machine-dependent and would make every diff noisy; the
// snapshot pins only the verdict/result, so it catches detection regressions
// (a TP that became FN) and surfaces progressions (a known FN that became TP).
const SNAPSHOT_FILE = path.join(REPO_ROOT, "bench/micro-snapshot.json");
const SNAPSHOT_RUNNERS = ["dynajs"];

// Preloaded by the `baseline` runner: stubs the taint prelude globals
// (`__set_taint__`/`__assert_taint__`) to no-ops so a bench runs as plain
// JS under stock node. Without it the bench throws `__set_taint__ is not
// defined` on the first line, and baseline would clock crash time instead of
// the program's actual execution time.
const BASELINE_IMPORT = pathToFileURL(
  path.join(REPO_ROOT, "bench/microbench-import-helper.mjs"),
).href;

// Per-assert marker: `@@DJX_VERDICT <actual> <expected>`. The 1st token is the
// outcome the analyzer computed; the 2nd is the assert's declared ground truth.
const VERDICT_RE = /@@DJX_VERDICT\s+(detected|clean|error)\s+(detected|clean)\b/g;

// Per-`@type` dynajs configuration. A bench tagged `// @type taint` runs under
// the analysis + flags listed here — no need to pass them on the CLI.
// `analysis` is resolved relative to the repo root. Add a row per analysis kind.
// `--analysis` / `--dynajs-flags` on the CLI override this for every bench.
const TYPE_CONFIG = {
  taint: { analysis: "analyses/dist/Taint.mjs", flags: "--partial --pos persist" },
  concolic: { analysis: "analyses/dist/Concolic.mjs", flags: "--partial" },
};

// --- NodeMedic (Jalangi instrumentation mode) -------------------------------
// The `nodemedic-jalangi` runner drives NodeMedic's taint engine under its
// Jalangi2-babel instrumentation, on the SAME bench files. NodeMedic's
// src/GhostFunction.ts registers `__set_taint__`/`__assert_taint__` (the dynajs
// taint prelude names), so each bench marks taint and emits the `@@DJX_VERDICT`
// marker identically — no bench rewriting needed. NB: that registration is
// out-of-tree and must be updated to the renamed `__assert_taint__(v, expected)`
// emitting the 2-token marker for this runner to score.
//
// Two gotchas the runner handles:
//   1. Jalangi instruments via the CommonJS loader (Module._extensions['.js']),
//      but bench/micro/*.js are ESM (dynajs package.json is "type":"module"),
//      so Jalangi would run them uninstrumented. We copy each bench into a
//      CommonJS-scoped temp dir before instrumenting.
//   2. NodeMedic resolves its deps (@babel/preset-env, immutable, ...) from its
//      own node_modules, so the run's cwd must be NODEMEDIC_HOME.
const NODEMEDIC_HOME =
  process.env.NODEMEDIC_HOME ?? path.join(homedir(), "NodeMedic-wip");
const NODEMEDIC_JALANGI_CMD = path.join(
  NODEMEDIC_HOME, "lib/jalangi2-babel/src/js/commands/jalangi.js",
);
const NODEMEDIC_REWRITE = path.join(NODEMEDIC_HOME, "src/rewrite.js");
// NodeMedic reads analysis args as positional argv after the script (Jalangi
// mode: config.setFromArgs(process.argv)), not from an env var.
const NODEMEDIC_ANALYSIS_ARGS = [
  "log_level=error",
  "policies=string:precise,array:precise,object:precise",
];

// A CommonJS-scoped scratch dir so Jalangi's `.js` loader hook instruments the
// bench copy. Created once; benches are copied in per run (see the runner).
let nmCjsDir = null;
function nodemedicCjsDir() {
  if (nmCjsDir) return nmCjsDir;
  nmCjsDir = path.join(tmpdir(), "dynajs-nodemedic-jalangi");
  mkdirSync(nmCjsDir, { recursive: true });
  writeFileSync(path.join(nmCjsDir, "package.json"), '{"type":"commonjs"}');
  return nmCjsDir;
}

// --- ExpoSE (dynamic symbolic execution) -----------------------------------
// The `expose` runner drives ExpoSE's symbolic execution engine on the SAME
// concolic bench files. ExpoSE exposes its symbolic API as `S$.symbol(name,
// seed)` / `S$.assert(cond)` (require("S$")), whereas the benches call the
// engine-neutral prelude names `__symbolic__` / `__symbolic_assert__`. We
// bridge by prepending a small prelude that requires S$ and registers those
// two names as globals -- mirroring how `nodemedic-jalangi` reuses the taint
// prelude names as ghost functions. No bench rewriting needed.
//
// Single-path comparison: `__symbolic_assert__` does NOT route to ExpoSE's
// concrete `S$.assert` (which only throws on the running path, leaving
// detection to the multi-path Distributor). It calls our added
// `Object._expose.assertSymbolic` (ExpoSE Analyser/src/SymbolicState.js), which
// solves `PC_seed ∧ ¬cond` ONCE and self-activates single-run mode (no
// branch-flipping) -- the exact single-path validity check dynajs concolic
// does. So this measures the two engines' modeling/solving on the same path,
// not their search. `__symbolic__` still uses S$.symbol (it handles symbol
// renaming and seeding through Object._expose.makeSymbolic).
//
// Polarity: assertSymbolic records one `error` (counterexample) iff `¬cond` is
// SAT under the seed PC, i.e. the assert is violable. So errors>=1 -> `clean`
// (violable); 0 errors -> `detected` (assert provably holds on this path) --
// the same polarity as dynajs concolic's `PC ∧ ¬assert` UNSAT -> detected.
//
// ExpoSE must be invoked through its own `scripts/analyse` entry point (which
// sources scripts/env and spawns Tester workers with the right NODE_PATH/cwd);
// calling Distributor.js directly leaves workers unable to emit their result
// JSON. So the run's cwd is EXPOSE_HOME and argv[0] is bash scripts/analyse.
const EXPOSE_HOME = process.env.EXPOSE_HOME ?? path.join(homedir(), "ExpoSE");
const EXPOSE_ANALYSE = path.join(EXPOSE_HOME, "scripts/analyse");
// Prepended to each bench copy: bridge the engine-neutral prelude names. The
// assert bridges to our single-path Object._expose.assertSymbolic (defined once
// ExpoSE's analysis initialises, before the bench body runs).
// The `expected` arg (the assert's ground truth) is ignored here: ExpoSE only
// checks `cond`'s validity; our runner reads `expected` from the bench source
// (see assertOracles) to classify the result. ExpoSE still reports one whole-run
// error count, not per-assert, so the expose runner only applies to single-
// assert benches (see its applies()); making it score per-assert would need
// ExpoSE's assertSymbolic patch to emit a per-assert @@DJX_VERDICT marker.
const EXPOSE_PRELUDE =
  'var S$ = require("S$");\n' +
  "globalThis.__symbolic__ = function (name, seed) { return S$.symbol(name, seed); };\n" +
  "globalThis.__symbolic_assert__ = function (cond, expected) { return Object._expose.assertSymbolic(cond); };\n";
// ExpoSE prints this summary line once a target finishes; the error count is
// our verdict signal (see the polarity note above).
const EXPOSE_DONE_RE = /ExpoSE Finished\.\s+\d+ paths,\s+(\d+) errors/;

// A scratch dir for the prelude-prepended bench copies ExpoSE analyses.
let exposeDir = null;
function exposeScratchDir() {
  if (exposeDir) return exposeDir;
  exposeDir = path.join(tmpdir(), "dynajs-expose");
  mkdirSync(exposeDir, { recursive: true });
  writeFileSync(path.join(exposeDir, "package.json"), '{"type":"commonjs"}');
  return exposeDir;
}

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

// Kind + classification from the file header. Returns null if there's no @type:
// the kind drives the dynajs config and which runners apply, so it's required
// now that ground truth lives per-assert (the `expected` arg) instead of in an
// `@oracle` header.
//   @type    NAME         dynajs config kind, e.g. taint (see TYPE_CONFIG)
//   @target  es5|es6+ ...     language level the bench exercises
//   @feature syntax|builtin ...   syntactic construct vs. builtin/library behavior
// @target/@feature classify by their FIRST token only; any further
// space-separated tokens are free-form notes (e.g. `@feature syntax binary-add`)
// and are ignored for grouping. Missing tags fall into the "(none)" group.
function parseMeta(file) {
  const head = readFileSync(file, "utf8").slice(0, 2048);
  const t = head.match(/@type\s+([A-Za-z0-9_-]+)/);
  if (!t) return null;
  const tg = head.match(/@target\s+([A-Za-z0-9_+.-]+)/i);
  const ft = head.match(/@feature\s+([A-Za-z0-9_-]+)/i);
  return {
    type: t[1],
    target: tg ? tg[1].toLowerCase() : "", // first token only; rest are notes
    feature: ft ? ft[1].toLowerCase() : "", // first token only; rest are notes
  };
}

// The per-assert `expected` booleans a bench declares, in source order: the last
// argument of each __symbolic_assert__/__assert_taint__ call (paren-matched, so
// commas inside the condition don't confuse it). Used by external runners that
// emit a single whole-run signal instead of our per-assert markers (expose), and
// to recover an assert's ground truth when a run crashes before emitting it.
function assertOracles(file) {
  const src = readFileSync(file, "utf8");
  const re = /__(?:symbolic_assert|assert_taint)__\s*\(/g;
  const out = [];
  let m;
  while ((m = re.exec(src))) {
    let depth = 0, lastComma = -1, i = re.lastIndex - 1;
    for (; i < src.length; i++) {
      const c = src[i];
      if (c === "(") depth++;
      else if (c === ")") { if (--depth === 0) break; }
      else if (c === "," && depth === 1) lastComma = i;
    }
    const arg = lastComma === -1 ? "" : src.slice(lastComma + 1, i).trim();
    out.push(arg === "true" ? true : arg === "false" ? false : null);
    re.lastIndex = i + 1;
  }
  return out;
}

// Run one iteration. Returns { code, ms, timedOut, stdout, stderr }, also
// writing stdout/stderr to the given files (null = discard).
// `cwd` defaults to the repo root; an external analyzer that resolves its deps
// from its own node_modules (e.g. NodeMedic) passes its home directory instead.
function timeRun(argv, env, stdoutFile, stderrFile, timeoutMs, cwd = REPO_ROOT) {
  const start = process.hrtime.bigint();
  const r = spawnSync(argv[0], argv.slice(1), {
    cwd,
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

// Default case parser: every @@DJX_VERDICT marker the analyzer printed becomes
// one case `{ actual, expected }`, in order. A timed-out run yields no usable
// markers (the caller treats an empty result as a single `error` case).
function defaultCases(run) {
  if (run.timedOut) return [];
  const text = `${run.stdout}\n${run.stderr}`;
  const cases = [];
  let m;
  VERDICT_RE.lastIndex = 0;
  while ((m = VERDICT_RE.exec(text))) cases.push({ actual: m[1], expected: m[2] });
  return cases;
}

// expected (detected=positive/clean=negative) x actual -> TP|FP|FN|TN
function classify(expected, actual) {
  if (expected === "detected") return actual === "detected" ? "TP" : "FN"; // clean|error -> FN
  return actual === "clean" ? "TN" : "FP"; //                  detected|error -> FP
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

// Confusion matrix over a list of per-bench records ({ cases:[{actual,result}],
// anyTimeout, mean }). Counts are per CASE (an assert); timing is per FILE (one
// run regardless of how many asserts it fired). Used for the overall table and
// each grouped slice.
function buildMatrix(recs) {
  const m = { TP: 0, FP: 0, FN: 0, TN: 0, err: 0, timeout: 0, meanSum: 0, files: 0 };
  for (const rec of recs) {
    for (const c of rec.cases) {
      m[c.result]++;
      if (c.actual === "error") m.err++;
    }
    if (rec.anyTimeout) m.timeout++;
    m.meanSum += rec.mean;
    m.files++;
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
    (m.files ? (m.meanSum / m.files).toFixed(1) : "0").padStart(10)
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
// snapshot (committed correctness baseline)
// ---------------------------------------------------------------------------

// Build the snapshot object from the per-runner records: { runner: { bench:
// [ { expected, actual, result }, ... ] } } — one entry per assert case, in
// order. Restricted to SNAPSHOT_RUNNERS and emitted with sorted keys so the
// committed JSON is a stable, reviewable diff.
function buildSnapshot(records) {
  const snap = {};
  for (const runner of SNAPSHOT_RUNNERS.filter((r) => records[r])) {
    const byBench = {};
    for (const rec of [...records[runner]].sort((a, b) => a.bench.name.localeCompare(b.bench.name)))
      byBench[rec.bench.name] = rec.cases.map((c) => ({
        expected: c.expected, actual: c.actual, result: c.result,
      }));
    snap[runner] = byBench;
  }
  return snap;
}

// Compare the current run's records against the committed snapshot. Returns
// { regressions, progressions, changes, added, removed } lists of human strings.
// Only (runner, bench) pairs that actually ran are compared; `removed` (in the
// snapshot but not run) is reported only on a full run, so a `--bench` filter
// doesn't flag everything it skipped. Any non-empty list except `progressions`
// fails the check (a progression is good news, but still needs a snapshot bump).
function diffSnapshot(records, snap, fullRun) {
  const out = { regressions: [], progressions: [], changes: [], added: [], removed: [] };
  const isRight = (r) => r === "TP" || r === "TN";
  const show = (c) => `${c.result} (${c.actual}/${c.expected})`;
  for (const runner of SNAPSHOT_RUNNERS.filter((r) => records[r])) {
    const want = snap[runner] ?? {};
    const seen = new Set();
    for (const rec of records[runner]) {
      seen.add(rec.bench.name);
      const prev = want[rec.bench.name];
      const cur = rec.cases;
      const where = `${runner}/${rec.bench.name}`;
      if (!prev) {
        out.added.push(`${where}: ${cur.length} case(s) — not in snapshot`);
        continue;
      }
      // Compare case-by-case in order; length changes are added/removed cases.
      for (let i = 0; i < Math.max(prev.length, cur.length); i++) {
        const p = prev[i], c = cur[i];
        const at = Math.max(prev.length, cur.length) > 1 ? `[${i}]` : "";
        if (!p) { out.added.push(`${where}${at}: ${show(c)} — new case`); continue; }
        if (!c) { out.removed.push(`${where}${at}: was ${show(p)} — case not produced`); continue; }
        if (p.expected === c.expected && p.actual === c.actual && p.result === c.result) continue;
        const desc = `${where}${at}: ${show(p)} -> ${show(c)}`;
        if (isRight(p.result) && !isRight(c.result)) out.regressions.push(desc);
        else if (!isRight(p.result) && isRight(c.result)) out.progressions.push(desc);
        else out.changes.push(desc); // verdict moved but correctness class didn't
      }
    }
    if (fullRun)
      for (const name of Object.keys(want))
        if (!seen.has(name)) out.removed.push(`${runner}/${name}: in snapshot but not run`);
  }
  return out;
}

// ---------------------------------------------------------------------------
// runners
//
// Each runner: { name, available(), exec(bench, out, err, timeoutMs), applies?, cases? }
//   - exec(bench, ...) gets the bench object ({ file, name, type, target, feature });
//     it returns the timeRun() result object.
//   - applies(bench) -> bool: skip this bench for this runner (default true).
//   - cases(run, bench) -> [{ actual, expected }, ...], one per assert. Defaults
//     to defaultCases, which reads the @@DJX_VERDICT stdout markers. Override only
//     for an external analyzer whose native output you'd rather parse directly.
// A runner whose available() is false is skipped with a notice.
// ---------------------------------------------------------------------------

function makeRunners(opts) {
  return [
    {
      // plain Node, no instrumentation: a pure-execution-time reference. The
      // taint prelude globals are stubbed to no-ops via BASELINE_IMPORT so the
      // bench runs as plain JS instead of crashing on the first `__set_taint__`
      // call. It never emits a verdict marker, so every bench lands in a single
      // `error` case -> a useful sanity floor; only its mean_ms is meaningful.
      name: "baseline",
      available: () => onPath("node"),
      exec: (b, out, err, t) =>
        timeRun(["node", "--import", BASELINE_IMPORT, b.file], {}, out, err, t),
    },
    {
      // this project's analyzer. Analysis + flags are picked per bench from its
      // `@type` (see TYPE_CONFIG), unless overridden by --analysis/--dynajs-flags.
      // The chosen analysis must print `@@DJX_VERDICT <actual> <expected>` per
      // assert (e.g. the taint prelude's __assert_taint__); else every run reads
      // as a single error.
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

    // --- external analyzers ------------------------------------------------
    {
      // NodeMedic's taint engine under Jalangi2-babel instrumentation. Runs the
      // same bench files via the __set_taint__/__assert_taint__ ghost functions
      // registered in NodeMedic's src/GhostFunction.ts, so the default
      // @@DJX_VERDICT parser works -- but that registration is out-of-tree, so
      // GhostFunction.ts must be updated to the renamed __assert_taint__(v,
      // expected) and emit the 2-token marker for this runner to score. Only
      // taint benches apply. See the NODEMEDIC_* config block above.
      name: "nodemedic-jalangi",
      applies: (b) => b.type === "taint",
      available: () =>
        existsSync(NODEMEDIC_JALANGI_CMD) && existsSync(NODEMEDIC_REWRITE),
      exec: (b, out, err, t) => {
        // Copy the bench into the CommonJS-scoped dir so Jalangi instruments it.
        // Key the copy on b.name (flattened relative path) so nested benches
        // sharing a basename don't clobber each other.
        const dest = path.join(nodemedicCjsDir(), `${b.name}.js`);
        writeFileSync(dest, readFileSync(b.file));
        return timeRun(
          [
            "node",
            NODEMEDIC_JALANGI_CMD,
            "--inlineIID", "--inlineSource",
            "--analysis", NODEMEDIC_REWRITE,
            dest,
            ...NODEMEDIC_ANALYSIS_ARGS,
          ],
          {}, out, err, t,
          NODEMEDIC_HOME, // cwd: resolve NodeMedic's own node_modules
        );
      },
    },
    {
      // ExpoSE's dynamic symbolic execution engine, on the same concolic
      // benches via the __symbolic__/__symbolic_assert__ -> S$ bridge prelude.
      // ExpoSE reports one whole-run error count, not per-assert markers, so this
      // runner only applies to SINGLE-assert concolic benches: it pairs the
      // whole-run verdict with that assert's static oracle (see cases below).
      // Multi-assert benches are skipped (logged) until ExpoSE's assertSymbolic
      // patch emits a per-assert @@DJX_VERDICT marker. See the EXPOSE_* config
      // block for the invocation and verdict polarity (errors>0 -> a
      // counterexample -> `clean`; 0 errors -> assert held -> `detected`).
      name: "expose",
      applies: (b) => b.type === "concolic" && assertOracles(b.file).length <= 1,
      available: () => existsSync(EXPOSE_ANALYSE),
      exec: (b, out, err, t) => {
        // Copy the bench with the S$ bridge prelude prepended. Key on b.name
        // (flattened relative path) so nested same-basename benches don't collide.
        const dest = path.join(exposeScratchDir(), `${b.name}.js`);
        writeFileSync(dest, EXPOSE_PRELUDE + readFileSync(b.file, "utf8"));
        return timeRun(
          ["bash", EXPOSE_ANALYSE, dest],
          // Cap ExpoSE's own budget under our per-run timeout so it self-stops
          // before the SIGKILL, leaving a parseable summary line.
          { EXPOSE_MAX_TIME: String(Math.max(1000, t - 2000)) },
          out, err, t,
          EXPOSE_HOME, // cwd: scripts/analyse sources ./scripts/env relatively
        );
      },
      cases: (run, b) => {
        // One whole-run verdict from the error count, paired with the single
        // assert's declared oracle. Empty -> the caller records one `error` case.
        if (run.timedOut) return [];
        const m = EXPOSE_DONE_RE.exec(`${run.stdout}\n${run.stderr}`);
        if (!m) return []; // no summary line: ExpoSE crashed/never finished
        const actual = Number(m[1]) > 0 ? "clean" : "detected";
        const expected = assertOracles(b.file)[0] === false ? "clean" : "detected";
        return [{ actual, expected }];
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
    check: false, // compare against the committed snapshot, exit non-zero on drift
    updateSnapshot: false, // (re)write the committed snapshot from this run
    repsSet: false, // whether --reps was passed (snapshot modes default reps to 1)
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
      case "--reps": opts.reps = Number(need(i, a)); opts.repsSet = true; i++; break;
      case "--warmup": opts.warmup = Number(need(i, a)); i++; break;
      case "--timeout": opts.timeoutSec = Number(need(i, a)); i++; break;
      case "--output-dir": opts.outputDir = need(i, a); i++; break;
      case "--check": opts.check = true; break;
      case "--update-snapshot": opts.updateSnapshot = true; break;
      case "--help":
        console.log(
          "Usage: node bench/run-micro-benchmark.mjs " +
            "[--runner NAME] [--bench NAME] [--analysis NAME] [--dynajs-flags STR] " +
            "[--reps N] [--warmup N] [--timeout SEC] [--output-dir DIR] " +
            "[--check | --update-snapshot]",
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
  if (opts.check && opts.updateSnapshot)
    die("--check and --update-snapshot are mutually exclusive");

  // Snapshot modes care only about the verdict (which is deterministic across
  // reps), not timing, so collapse to a single rep with no warmup unless the
  // caller asked otherwise, and gate only the snapshotted runners so the check
  // doesn't need the external analyzers installed.
  const snapshotMode = opts.check || opts.updateSnapshot;
  if (snapshotMode) {
    if (!opts.repsSet) { opts.reps = 1; opts.warmup = 0; }
    if (!opts.runnerFilters.length) opts.runnerFilters = [...SNAPSHOT_RUNNERS];
  }

  const timeoutMs = opts.timeoutSec * 1000;

  if (!existsSync(BENCH_DIR)) die(`no benchmark dir: ${BENCH_DIR}`);

  // Collect benches with a `@type` header; warn and skip the rest. Walked
  // recursively, so benches can be grouped into subfolders under bench/micro.
  // The path relative to BENCH_DIR (separators flattened to `__`) becomes the
  // bench name, so nested benches sharing a basename don't collide in the log
  // and temp-copy filenames keyed off it.
  let benches = [];
  const benchFiles = readdirSync(BENCH_DIR, { recursive: true })
    .filter((f) => f.endsWith(".js") && !f.endsWith("__dynajs__.js"))
    .sort();
  for (const rel of benchFiles) {
    const file = path.join(BENCH_DIR, rel);
    const meta = parseMeta(file);
    if (!meta) {
      console.error(`skip ${rel} (no \`// @type\` header)`);
      continue;
    }
    benches.push({ file, name: stripExt(rel).replace(/[\\/]/g, "__"), ...meta });
  }
  if (opts.benchFilters.length)
    benches = benches.filter((b) => matchesAny(path.basename(b.file), opts.benchFilters));
  if (!benches.length) die("no benchmarks with a @type header matched");

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
  writeFileSync(csvFile, "runner,benchmark,type,target,feature,rep,case,expected,actual,result,exit_code,timed_out,elapsed_ms\n");

  console.log(`Output directory: ${outputDir}`);
  console.log(`Runners: ${active.map((r) => r.name).join(", ")}`);
  console.log(
    `Benchmarks: ${benches.length} files` +
      `   reps: ${opts.reps}   warmup: ${opts.warmup}   timeout: ${opts.timeoutSec}s\n`,
  );
  console.log(
    "runner".padEnd(12) + "benchmark".padEnd(24) + "expected".padEnd(10) +
      "actual".padEnd(10) + "result".padStart(7) + "mean_ms".padStart(10),
  );

  // Per-bench outcomes, kept so the report can slice them any number of ways
  // (overall, by @target, by @feature). records[runner] = [{ bench, cases:
  // [{actual, expected, result}], anyTimeout, mean }, ...]; counts are per case.
  const records = {};
  for (const r of active) records[r.name] = [];

  // Each marker is one assert case; a run with no marker (crash/timeout before
  // any assert fires) collapses to a single `error` case so it isn't silently
  // dropped — its expected is recovered from the bench's first declared oracle.
  const toCases = (raw, b) =>
    raw.length
      ? raw
      : [{ actual: "error", expected: assertOracles(b.file)[0] === false ? "clean" : "detected" }];
  const sig = (cs) => cs.map((c) => `${c.actual}/${c.expected}`).join(",");

  for (const r of active) {
    const casesOf = r.cases ?? defaultCases;
    for (const b of benches) {
      if (r.applies && !r.applies(b)) {
        console.error(`skip ${r.name}/${b.name} (not applicable)`);
        continue;
      }
      for (let w = 0; w < opts.warmup; w++) r.exec(b, null, null, timeoutMs);

      const samples = [];
      const sigs = [];
      let anyTimeout = false;
      let firstCases = null;
      for (let rep = 1; rep <= opts.reps; rep++) {
        const prefix = `${r.name}__${b.name}__rep${rep}`;
        const run = r.exec(
          b,
          path.join(logsDir, `${prefix}.stdout`),
          path.join(logsDir, `${prefix}.stderr`),
          timeoutMs,
        );
        const cases = toCases(casesOf(run, b), b);
        samples.push(run.ms);
        sigs.push(sig(cases));
        if (run.timedOut) anyTimeout = true;
        if (rep === 1) firstCases = cases;
        cases.forEach((c, i) =>
          appendFileSync(
            csvFile,
            `${r.name},${b.name},${b.type},${b.target},${b.feature},${rep},${i},${c.expected},${c.actual},${classify(c.expected, c.actual)},${run.code},${run.timedOut},${run.ms.toFixed(1)}\n`,
          ),
        );
      }

      // Cases should be deterministic across reps; warn if not, use rep 1.
      if (sigs.some((s) => s !== sigs[0]))
        console.error(`warn ${r.name}/${b.name}: inconsistent cases across reps: ${sigs.join(" | ")}`);

      const cases = firstCases.map((c) => ({ ...c, result: classify(c.expected, c.actual) }));
      const mean = samples.reduce((a, c) => a + c, 0) / samples.length;
      records[r.name].push({ bench: b, cases, anyTimeout, mean });

      cases.forEach((c, i) => {
        const tag = cases.length > 1 ? `${b.name}[${i}]` : b.name;
        console.log(
          r.name.padEnd(12) + tag.padEnd(24) + c.expected.padEnd(10) +
            c.actual.padEnd(10) + colorResult(c.result, c.result.padStart(7)) +
            (i === 0 ? mean.toFixed(1).padStart(10) : ""),
        );
      });
    }
  }

  // --- snapshot write / check --------------------------------------------
  // A snapshot run gates on correctness, so the report below is noise; handle
  // the snapshot and return before printing the confusion matrix.
  if (opts.updateSnapshot) {
    const snap = buildSnapshot(records);
    writeFileSync(SNAPSHOT_FILE, JSON.stringify(snap, null, 2) + "\n");
    const n = Object.values(snap).reduce((a, m) => a + Object.keys(m).length, 0);
    console.log(`\nWrote snapshot: ${path.relative(REPO_ROOT, SNAPSHOT_FILE)} (${n} entries across ${Object.keys(snap).length} runner(s))`);
    return;
  }
  if (opts.check) {
    if (!existsSync(SNAPSHOT_FILE))
      die(`no snapshot at ${path.relative(REPO_ROOT, SNAPSHOT_FILE)} — run with --update-snapshot first`);
    const snap = JSON.parse(readFileSync(SNAPSHOT_FILE, "utf8"));
    const fullRun = !opts.benchFilters.length;
    const d = diffSnapshot(records, snap, fullRun);
    console.log("\nSnapshot check:");
    const section = (title, list, paint) => {
      if (!list.length) return;
      console.log(`  ${title}:`);
      for (const line of list) console.log(`    ${paint ? paint(line) : line}`);
    };
    section("REGRESSIONS", d.regressions, red);
    section("verdict changes (same correctness class)", d.changes, red);
    section("new benches missing from snapshot", d.added, red);
    section("snapshot entries not produced by this run", d.removed, red);
    section("progressions (snapshot can be updated)", d.progressions, green);
    const fail = d.regressions.length + d.changes.length + d.added.length + d.removed.length;
    if (fail) {
      console.log(red(`\n${fail} drift(s) from snapshot — run --update-snapshot to accept.`));
      process.exit(1);
    }
    console.log(green(`\nOK — matches snapshot${d.progressions.length ? " (progressions noted above)" : ""}.`));
    return;
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