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
//      emits no marker at all (crash/timeout before any assert) errored as a
//      whole: it scores one `error` case per declared assert, so the total still
//      matches the assertion census.
//   4. builds a confusion matrix per runner (counting cases, not files) and
//      reports precision / recall / F1 / accuracy. The `@type concolic-replay`
//      reach corpus is scored separately in a PASS/FAIL/paths/time table.
//
// Scoring (per case, from its marker's expected token):
//   expected=detected (positive): detected -> TP    clean|error -> FN
//   expected=clean    (negative): clean    -> TN    detected|error -> FP
// The raw error/timeout counts are also surfaced separately.
//
// Usage:
//   node bench/run-micro-benchmark.mjs [options]
//   --runner NAME     run only the named runner (repeatable)
//   --bench NAME      run only benchmarks matching NAME or NAME.js (repeatable)
//   --dir SUB         run only benches under bench/micro/SUB (repeatable)
//   --count           print how many benches match (taint counted by assert,
//                     concolic-replay by file), with a @type/@target/@feature
//                     breakdown, and exit; no runner, no build, no execution
//   --replay          run ONLY the multi-path *-replay runners (dynajs-co-replay,
//                     expose-replay) over the bench/concolic reach corpus. The
//                     default run EXCLUDES them; this flag is their separate run.
//                     Reports a `runs` column: program executions to reach the
//                     guarded throw (from ExpoSE's `N paths` tally)
//   --coverage        census of @done progress per area (BuiltIns/Syntax) and
//                     subarea: covered units / universe. BuiltIns universe =
//                     ECMAScript spec members (SPEC_BUILTIN_TOTAL); Syntax =
//                     test262 language feature dirs (SYNTAX_T262_TOTAL), with
//                     grouped members weighted (T262_MEMBER_WEIGHT). `*` = no
//                     universe -> vs benched members. Taint only; no run/build
//   --analysis NAME   analysis dynajs runs with (default: samples/EmptyAnalysis.js)
//   --reps N          measured iterations per (runner, bench)   (default: 1)
//   --warmup N        discarded warmup iterations               (default: 0)
//                     (defaults are verdict-only: verdicts are deterministic, so
//                      1 rep suffices; pass --reps 10 --warmup 2 for stable timing)
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
  writeFileSync, appendFileSync, accessSync, constants, realpathSync,
} from "node:fs";
import path from "node:path";
import { homedir, tmpdir } from "node:os";
import { fileURLToPath, pathToFileURL } from "node:url";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BENCH_DIR = path.join(REPO_ROOT, "bench/micro");
// Second bench root: the multi-path "reach" corpus. These files `require("S$")`
// (so the dir is CommonJS-scoped via its own package.json) and guard a `throw`
// behind a branch the seed does NOT take, scored by the *-replay runners under
// ExpoSE's Distributor. Optional — skipped if absent.
const CONCOLIC_BENCH_DIR = path.join(REPO_ROOT, "bench/concolic");

// Committed correctness baseline (--update-snapshot writes it, --check compares
// against it). Only the runners listed here are snapshotted: the `dynajs-*`
// runners are the engine we own and the only ones whose verdict is
// deterministic in CI; the external analyzers (expose/nodemedic-jalangi) depend
// on out-of-tree installs ($EXPOSE_HOME/$NODEMEDIC_HOME) and aren't gated.
// Timing is deliberately NOT recorded — mean_ms is machine-dependent and would
// make every diff noisy; the snapshot pins only the verdict/result, so it
// catches detection regressions (a TP that became FN) and surfaces progressions
// (a known FN that became TP). One key per dynajs runner; keep in sync with the
// `dynajs-<short>` names TYPE_CONFIG generates.
const SNAPSHOT_FILE = path.join(REPO_ROOT, "bench/micro-snapshot.json");
// Concolic is abandoned, so the scored run is taint-only (see the bench-load
// filter in main()); only the taint runner is snapshotted.
const SNAPSHOT_RUNNERS = ["dynajs-ta"];

// Preloaded by the `baseline` runner: stubs the taint prelude globals
// (`__set_taint__`/`__assert_taint__`) to no-ops so a bench runs as plain
// JS under stock node. Without it the bench throws `__set_taint__ is not
// defined` on the first line, and baseline would clock crash time instead of
// the program's actual execution time.
const BASELINE_IMPORT = pathToFileURL(
  path.join(REPO_ROOT, "bench/microbench-import-helper.mjs"),
).href;

// `@@DJX_EXEC_MS <ms>` — in-process execution time of the bench BODY, printed by
// the timing TAIL appended to each bench copy. NaN if the run never reached the
// tail (timeout, or an uncaught throw before the last line).
const EXEC_MS_RE = /@@DJX_EXEC_MS\s+([\d.]+)/;
function execMs(run) {
  const m = `${run.stdout}\n${run.stderr}`.match(EXEC_MS_RE);
  return m ? Number(m[1]) : NaN;
}

// `ExpoSE Finished. N paths, M errors` — the Distributor's tally of how many
// program executions (paths) the multi-path search ran. This is the "runs"
// metric for the *-replay runners: because EXPOSE_STOP_ON_ERROR=Reachable halts
// the search the moment the guarded throw is hit, N is the number of program
// runs it took to REACH the target (the reaching run included). Concurrency
// (the worker pool) means a few extra paths may already be in flight when the
// reach lands, so N is an upper bound on the minimal reach depth, not exact.
// NaN when the line is absent (a crash/timeout before the Distributor finished,
// or a non-replay runner that never drives ExpoSE).
const PATHS_RE = /ExpoSE Finished\.\s+(\d+)\s+paths/;
function pathRuns(run) {
  const m = `${run.stdout}\n${run.stderr}`.match(PATHS_RE);
  return m ? Number(m[1]) : NaN;
}

// Uniform in-process exec timer for EVERY runner, measuring t0(FIRST executed
// line) -> t1(LAST executed line) of the bench body, in-process. We wrap a COPY
// of the bench: HEAD stamps t0, TAIL stamps t1 and prints @@DJX_EXEC_MS. Because
// the bench is instrumented at LOAD (before t0) and the engine boots before that,
// this window excludes BOTH bootstrap and instrumentation — it is execution only,
// the same boundary for baseline/dynajs/nodemedic, so exec_ms is directly
// comparable (vs the spawnSync wall-clock mean_ms, ~98% bootstrap here).
//   NB t1 is the LAST LINE, NOT process 'exit': timing to the exit event folds in
//   node's teardown window, which differs by runtime and was large enough to
//   INVERT the comparison (dynajs read faster than plain node — impossible). The
//   tail line is the fix. It is a single in-process, COLD (no warmup) measurement;
//   loop the body for warm steady-state. Uses `globalThis.performance` (a node
//   global) so one string works in ESM (baseline/dynajs .mjs) and CJS (nodemedic).
// Two subtle traps make the timing window leak ~1ms of stream lazy-init if you
// aren't careful — they were why exec_ms once inverted (instrumented dynajs read
// *faster* than plain node):
//   1. A stream's FIRST write lazily initializes it (~1ms). dynajs's verdict
//      `console.log` hits stdout and our marker hits stderr — so HEAD pre-warms
//      BOTH streams (before t0) to push that one-time init out of the window.
//   2. `process.stderr.write(EXPR)` evaluates the `process.stderr` getter (which
//      can trigger that init) BEFORE its argument, so reading now() *inside* the
//      argument captures it AFTER the init. TAIL therefore stamps t1 into a var
//      on its own line FIRST, then writes the marker.
const TIMING_HEAD =
  'process.stdout.write("");process.stderr.write("");' +
  "globalThis.__djx_t0=globalThis.performance.now();\n";
const TIMING_TAIL =
  "\nglobalThis.__djx_t1=globalThis.performance.now();\n" +
  'process.stderr.write("@@DJX_EXEC_MS "+' +
  '(globalThis.__djx_t1-globalThis.__djx_t0).toFixed(3)+"\\n");\n';
const withTiming = (src) => TIMING_HEAD + src + TIMING_TAIL;

// Scratch dir for the prelude-prepended copies baseline/dynajs run (nodemedic/
// expose keep their own analyzer-scoped copy dirs). dynajs only instruments
// files under an include root (cwd is the sole default), so the dynajs runner
// passes this dir via `--include`. Copies are .mjs to match the bench/micro tree
// (dynajs package.json is "type":"module") so the timer's `globalThis` works.
let benchCopyDirCache = null;
function benchCopyDir() {
  if (benchCopyDirCache) return benchCopyDirCache;
  const dir = path.join(tmpdir(), "dynajs-bench-exec-copies");
  mkdirSync(dir, { recursive: true });
  // Resolve symlinks (macOS /var -> /private/var): node resolves the bench
  // module to its realpath, so dynajs's --include root must be the realpath too,
  // else isInstrumentTarget's isUnder() check fails and the copy would run
  // UNINSTRUMENTED (taint never propagates -> every positive scores FN).
  benchCopyDirCache = realpathSync(dir);
  return benchCopyDirCache;
}
// Write the timing-wrapped bench to a .mjs copy keyed on b.name (flattened
// relative path, so nested same-basename benches don't collide); return its path.
function timedBenchCopy(b) {
  const dest = path.join(benchCopyDir(), `${b.name}.mjs`);
  writeFileSync(dest, withTiming(readFileSync(b.file, "utf8")));
  return dest;
}

// Per-assert marker: `@@DJX_VERDICT <actual> <expected>`. The 1st token is the
// outcome the analyzer computed; the 2nd is the assert's declared ground truth.
// Two vocabularies share the marker: taint/validity asserts emit detected|clean,
// SAT-query (`__IS_SAT__`) asserts emit sat|unsat. `error` is an actual-only
// outcome. classify() treats detected≡sat (positive) and clean≡unsat (negative).
const VERDICT_RE =
  /@@DJX_VERDICT\s+(detected|clean|sat|unsat|error)\s+(detected|clean|sat|unsat)\b/g;

// Per-`@type` dynajs configuration. A bench tagged `// @type taint` runs under
// the analysis + flags listed here — no need to pass them on the CLI.
// `analysis` is resolved relative to the repo root. Add a row per analysis kind.
// `--analysis` / `--dynajs-flags` on the CLI override this for every bench.
// `short` names the per-type dynajs runner (`dynajs-<short>`, see makeRunners),
// so each `@type` is scored as its own runner that still shares the `dynajs`
// group (the confusion matrix prints them apart and combined).
const TYPE_CONFIG = {
  taint: { short: "ta", analysis: "analyses/dist/Taint.mjs", flags: "--partial --pos persist" },
};

// Spec member universe per BuiltIn, hand-set (cf. scripts/spec-coverage.mjs's
// TOTAL_BUILTINS). --coverage divides @done methods by this so the denominator
// is the whole ECMAScript surface for that BuiltIn — static + prototype members
// incl. accessors/symbols, counted once from Node's runtime — not just the
// method folders that exist. Tune freely; a subarea absent here (global, all
// Syntax) falls back to its benched-member count in the report (marked `*`).
const SPEC_BUILTIN_TOTAL = {
  "BuiltIns/Array": 45,
  "BuiltIns/String": 55,
  "BuiltIns/RegExp": 39,
  "BuiltIns/JSON": 3,
  "BuiltIns/Object": 33,
  "BuiltIns/Number": 20,
  "BuiltIns/Map": 13,
  "BuiltIns/Set": 12,
  "BuiltIns/Function": 9,
  "BuiltIns/Math": 44,
};

// Syntax universe = test262 `test/language` feature-directory count per category
// (statements/ 29 + expressions/ 68 + literals/ 6, filtered to the constructs
// these benches target). --coverage divides by this for Syntax subareas. Hand-
// set from the tc39/test262 tree; tune freely. A subarea absent here (e.g. no
// taint benches yet) falls back to its benched-member count, marked `*`.
const SYNTAX_T262_TOTAL = {
  "Syntax/Operators": 44,
  "Syntax/ControlFlow": 11,
  "Syntax/Functions": 16,
  "Syntax/Variables": 9,
  "Syntax/Literals": 12,
  "Syntax/Classes": 11,
  "Syntax/Objects": 6,
  "Syntax/Exceptions": 3,
  "Syntax/RegExp": 8,
};

// How many test262 feature dirs a repo member represents. Most members are 1:1
// (default 1), but some Syntax members group several test262 dirs into one
// folder — e.g. Operators/arithmetic covers addition/subtraction/.../modulus.
// --coverage credits a @done member with its full weight, so the numerator is
// in the same test262-dir unit as the SYNTAX_T262_TOTAL denominator. Keyed by
// member dir relative to bench/micro.
const T262_MEMBER_WEIGHT = {
  "Syntax/Operators/arithmetic": 5,          // addition, subtraction, multiplication, division, modulus
  "Syntax/Operators/bitwise": 7,             // and, or, xor, not, <<, >>, >>>
  "Syntax/Operators/equality": 4,            // ==, !=, ===, !==
  "Syntax/Operators/relational": 4,          // <, >, <=, >=
  "Syntax/Operators/logical": 3,             // &&, ||, !
  "Syntax/Operators/increment-decrement": 4, // prefix/postfix ++/--
  "Syntax/Operators/member-access": 2,       // member-expression, property-accessors
  "Syntax/Operators/unary": 2,               // unary-minus, unary-plus
  "Syntax/ControlFlow/break-continue": 2,    // break, continue
  "Syntax/Functions/async-await": 4,         // async-function (stmt/expr), async-arrow, await
  "Syntax/Functions/generators": 3,          // generators (stmt/expr), yield
  "Syntax/Functions/rest-spread": 2,         // rest-parameters, spread
  "Syntax/Variables/let-const": 2,           // let, const
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
  process.env.NODEMEDIC_HOME ?? path.join(homedir(), "arts/NodeMedic-FINE");
const NODEMEDIC_JALANGI_CMD = path.join(
  NODEMEDIC_HOME, "lib/jalangi2-babel/src/js/commands/jalangi.js",
);
const NODEMEDIC_REWRITE = path.join(NODEMEDIC_HOME, "src/rewrite.js");
// NodeMedic reads analysis args as positional argv after the script (Jalangi
// mode: config.setFromArgs(process.argv)), not from an env var.
// `string:precise-no-flip` selects NodeMedic-FINE's precise per-character string
// model but WITHOUT the bit-flipping encode/decode pass (StringPolicyPreciseNoFlip
// in src/modules/String.ts). It requires NodeMedic-FINE: both the precise-no-flip
// policy and the __set_taint__/__print_if_tainted__ verdict ghosts live there
// (stock NodeMedic-wip has neither). Override via $NODEMEDIC_POLICIES for wip.
const NODEMEDIC_ANALYSIS_ARGS = [
  "log_level=error",
  `policies=${process.env.NODEMEDIC_POLICIES ?? "string:precise,array:precise,object:precise"}`,
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

// --- ExpoSE (multi-path reach search) --------------------------------------
// The `*-replay` runners drive ExpoSE's Distributor (multi-path symbolic
// search) over the bench/concolic reach corpus. Each reach bench guards
// `throw "<REACH_SENTINEL>"` behind a branch the seed does NOT take, so
// reaching it requires the search to solve+replay an alternative input. The
// verdict is reached/not (sat/unsat), read from the Distributor's `[!] <value>`
// findings — see reachCases(). dynajs-co-replay runs the dynajs concolic
// drop-in as the play script; expose-replay runs stock ExpoSE, for a
// like-for-like comparison of the two engines' search on the same corpus.
const EXPOSE_HOME = process.env.EXPOSE_HOME ?? path.join(homedir(), "ExpoSE");
// Multi-path entry: ExpoSE's Distributor (scripts/analyse). dynajs-co-replay
// selects the dynajs concolic drop-in via EXPOSE_PLAY_SCRIPT=scripts/dynajs-play;
// expose-replay leaves it unset so the Distributor uses its own scripts/play.
const EXPOSE_ANALYSE = path.join(EXPOSE_HOME, "scripts/analyse");
const EXPOSE_DYNAJS_PLAY = path.join(EXPOSE_HOME, "scripts/dynajs-play");
// The guarded throw a reach bench expects the search to penetrate. The
// Distributor prints each uncaught throw as a `[!] <value>` finding; a finding
// with this value means the branch was reached.
const REACH_SENTINEL = "Reachable";
// ExpoSE's global per-bench search budget (EXPOSE_MAX_TIME). The replay runners
// cap it so a path-exploding bench (e.g. Array.join over a symbolic-length
// array, whose alternatives keep proposing longer arrays) SELF-terminates and
// reaps its worker pool — instead of running until the spawnSync timeout
// SIGKILLs `bash scripts/analyse`, which orphans the detached Distributor
// workers. Keep the spawnSync backstop (below) strictly longer so ExpoSE always
// shuts down first. Microbench paths reach in well under this; the cap only
// bites the explosions (where a bounded budget still finds the reach, then stops).
const EXPOSE_MAX_SECONDS = Number(process.env.EXPOSE_MAX_SECONDS ?? 10);
// Env injected into every replay run. Besides the budget, EXPOSE_STOP_ON_ERROR
// halts the Distributor at the first path whose uncaught throw contains the reach
// sentinel ("Reachable"): a reach bench's verdict is decided the moment the
// guarded throw is hit (reached = sat), so exploring further paths only wastes
// time — for a path-exploder this turns a full-budget run into a sub-second one.
// It matches the throw VALUE, so an infrastructure error never stops it early,
// and the reach/not verdict is unchanged (a not_reached bench has no matching
// throw, so it still explores to exhaustion/budget). Set EXPOSE_STOP_ON_ERROR=""
// to explore every path regardless (e.g. for coverage numbers).
const EXPOSE_REPLAY_ENV = {
  EXPOSE_MAX_TIME: `${EXPOSE_MAX_SECONDS}s`,
  EXPOSE_TEST_TIMEOUT: `${EXPOSE_MAX_SECONDS}s`,
  EXPOSE_STOP_ON_ERROR: process.env.EXPOSE_STOP_ON_ERROR ?? REACH_SENTINEL,
};
// spawnSync timeout for the replay runners: never shorter than ExpoSE's own
// budget + a 5s graceful-shutdown window (else the SIGKILL races ahead of the
// clean self-termination and re-introduces orphans).
const exposeBackstopMs = (t) => Math.max(t, (EXPOSE_MAX_SECONDS + 5) * 1000);

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
  // Reach oracle for @type concolic-replay: `@reach true` = the guarded throw
  // SHOULD be reachable by the search (sat), `false` = it should NOT (unsat).
  // null for benches without it (the single-path corpus uses per-assert oracles).
  const rc = head.match(/@reach\s+(true|false)/i);
  return {
    type: t[1],
    target: tg ? tg[1].toLowerCase() : "", // first token only; rest are notes
    feature: ft ? ft[1].toLowerCase() : "", // first token only; rest are notes
    reach: rc ? rc[1].toLowerCase() === "true" : null,
    // eye-verified marker: a `// @done` header line. `--done` restricts the run to only these.
    done: /^\/\/\s*@done\b/m.test(head),
  };
}

// The per-assert `expected` booleans a bench declares, in source order: the last
// argument of each __symbolic_assert__/__assert_taint__ call (paren-matched, so
// commas inside the condition don't confuse it). Used to recover an assert's
// ground truth when a run crashes before emitting any verdict marker (toCases).
function assertOracles(file) {
  const src = readFileSync(file, "utf8");
  const re = /__(?:symbolic_assert|assert_taint|IS_SAT)__\s*\(/g;
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

// Reach-corpus case parser (the *-replay runners). One case per file: the search
// either penetrated the guarded branch (a `[!] <REACH_SENTINEL>` finding in the
// Distributor output -> `sat`) or it did not (`unsat`). `@reach` is the ground
// truth (sat = should be reachable), so classify() scores TP/FN/FP/TN over the
// same sat/unsat vocabulary as the IS_SAT benches. A timeout, or a run that never
// printed `ExpoSE Finished` (the Distributor itself crashed), is `error` rather
// than a misleading `unsat`. The witness input varies run to run, but this
// reached/not verdict is deterministic.
function reachCases(run, b) {
  const expected = b.reach === false ? "unsat" : "sat";
  if (run.timedOut) return [{ actual: "error", expected }];
  const text = `${run.stdout}\n${run.stderr}`;
  if (!/ExpoSE Finished\./.test(text)) return [{ actual: "error", expected }];
  const reached = new RegExp(`\\[!\\]\\s+${REACH_SENTINEL}\\b`).test(text);
  return [{ actual: reached ? "sat" : "unsat", expected }];
}

// expected (positive/negative) x actual -> TP|FP|FN|TN. Positive = detected (a
// taint finding) or sat (a satisfying witness); negative = clean or unsat.
// Neither `error` (a crash/timeout) nor `none` (a noVerdict runner's structural
// no-marker, e.g. baseline) is ever positive or a clean/unsat negative, so both
// score FN against a positive oracle and FP against a negative one.
function classify(expected, actual) {
  const pos = (x) => x === "detected" || x === "sat";
  if (pos(expected)) return pos(actual) ? "TP" : "FN"; // clean|unsat|error -> FN
  return actual === "clean" || actual === "unsat" ? "TN" : "FP"; // sat|detected|error -> FP
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
  const m = {
    TP: 0, FP: 0, FN: 0, TN: 0, err: 0, timeout: 0,
    meanSum: 0, files: 0, execSum: 0, execFiles: 0, runsSum: 0, runsFiles: 0,
  };
  for (const rec of recs) {
    for (const c of rec.cases) {
      m[c.result]++;
      if (c.actual === "error") m.err++;
    }
    if (rec.anyTimeout) m.timeout++;
    m.meanSum += rec.mean;
    m.files++;
    // exec_ms is in-process body time; skip files whose run never printed the
    // marker (timeout/throw before the timing tail) so the mean isn't NaN.
    if (Number.isFinite(rec.execMin)) { m.execSum += rec.execMin; m.execFiles++; }
    // runs = program executions to reach (the *-replay runners); NaN for other
    // runners and for a replay run that never printed the Finished tally.
    if (Number.isFinite(rec.runsMin)) { m.runsSum += rec.runsMin; m.runsFiles++; }
  }
  return m;
}

// One confusion-matrix row: `label` then TP/FP/FN/TN/err/t-o, precision,
// recall, F1, accuracy, mean_ms. Shared by the overall table and the grouped
// breakdowns. accuracy = (TP+TN)/(TP+TN+FP+FN): the share of all cases scored
// right (errors land in FP/FN per classify(), so they drag it down too).
function matrixRow(label, m) {
  const precision = ratio(m.TP, m.TP + m.FP);
  const recall = ratio(m.TP, m.TP + m.FN);
  const f1 =
    precision === null || recall === null || precision + recall === 0
      ? null
      : (2 * precision * recall) / (precision + recall);
  const accuracy = ratio(m.TP + m.TN, m.TP + m.TN + m.FP + m.FN);
  return (
    label.padEnd(24) +
    green(String(m.TP).padStart(5)) + red(String(m.FP).padStart(5)) +
    red(String(m.FN).padStart(5)) + green(String(m.TN).padStart(5)) +
    [m.err, m.timeout].map((x) => String(x).padStart(5)).join("") +
    fmtRatio(precision).padStart(11) + fmtRatio(recall).padStart(9) +
    fmtRatio(f1).padStart(8) + fmtRatio(accuracy).padStart(10) +
    (m.files ? (m.meanSum / m.files).toFixed(1) : "0").padStart(10) +
    (m.execFiles ? (m.execSum / m.execFiles).toFixed(2) : "n/a").padStart(10) +
    (m.runsFiles ? (m.runsSum / m.runsFiles).toFixed(1) : "n/a").padStart(9)
  );
}

const matrixHeader = (lead) =>
  lead.padEnd(24) +
  green("TP".padStart(5)) + red("FP".padStart(5)) +
  red("FN".padStart(5)) + green("TN".padStart(5)) +
  ["err", "t/o"].map((h) => h.padStart(5)).join("") +
  "precision".padStart(11) + "recall".padStart(9) + "F1".padStart(8) +
  "accuracy".padStart(10) + "mean_ms".padStart(10) + "exec_ms".padStart(10) +
  "runs".padStart(9);

// Reach table for the concolic-replay runners. Multi-path search either reached
// the guarded throw or not, so precision/recall is meaningless — what matters is
// how many reach probes it got right (PASS = TP+TN, FAIL = FP+FN, with a crash/
// timeout counting as FAIL via classify), the mean program executions to reach
// (Paths = the `runs` tally), and wall-clock (Time). Reuses buildMatrix's counts.
const reachHeader = (lead) =>
  lead.padEnd(24) +
  green("PASS".padStart(6)) + red("FAIL".padStart(6)) +
  "accuracy".padStart(10) + "paths".padStart(9) + "time_ms".padStart(10);
function reachRow(label, m) {
  const pass = m.TP + m.TN;
  const fail = m.FP + m.FN;
  return (
    label.padEnd(24) +
    green(String(pass).padStart(6)) + red(String(fail).padStart(6)) +
    fmtRatio(ratio(pass, pass + fail)).padStart(10) +
    (m.runsFiles ? (m.runsSum / m.runsFiles).toFixed(1) : "n/a").padStart(9) +
    (m.files ? (m.meanSum / m.files).toFixed(1) : "0").padStart(10)
  );
}

// The rows the report prints, in order: one per active runner, then one per
// `group` that has >1 active runner — a combined slice pooling all that group's
// records (e.g. dynajs-ta + dynajs-co -> `dynajs (all)`). Each is { label, recs }
// and feeds buildMatrix unchanged, so the overall table and every grouped
// breakdown show both the split and the combined view from a single list.
function matrixSources(active, records) {
  const sources = active.map((r) => ({ label: r.name, recs: records[r.name] }));
  const groups = new Map();
  for (const r of active) {
    if (!r.group) continue;
    (groups.get(r.group) ?? groups.set(r.group, []).get(r.group)).push(r);
  }
  for (const [g, rs] of groups)
    if (rs.length > 1)
      sources.push({ label: `${g} (all)`, recs: rs.flatMap((r) => records[r.name]) });
  return sources;
}

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
// Each runner: { name, group?, available(), exec(bench, out, err, timeoutMs), applies?, cases? }
//   - exec(bench, ...) gets the bench object ({ file, name, type, target, feature });
//     it returns the timeRun() result object.
//   - applies(bench) -> bool: skip this bench for this runner (default true).
//   - cases(run, bench) -> [{ actual, expected }, ...], one per assert. Defaults
//     to defaultCases, which reads the @@DJX_VERDICT stdout markers. Override only
//     for an external analyzer whose native output you'd rather parse directly.
//   - group?: runners sharing a group are also reported as one combined matrix
//     row (e.g. dynajs-ta + dynajs-co -> `dynajs (all)`). See matrixSources.
// A runner whose available() is false is skipped with a notice.
// ---------------------------------------------------------------------------

function makeRunners(opts) {
  return [
    {
      // plain Node, no instrumentation: a pure-execution-time reference. The
      // taint prelude globals are stubbed to no-ops via BASELINE_IMPORT so the
      // bench runs as plain JS instead of crashing on the first `__set_taint__`
      // call. It never emits a verdict marker by design (it's not a detector),
      // so it can't score TP/TN — every assert lands in FP/FN. `noVerdict`
      // marks that: the missing marker on a CLEAN exit is structural, not a
      // crash, so it's relabeled `none` (still FP/FN via classify, but NOT
      // tallied in the `err` column). A genuine baseline crash (nonzero exit /
      // timeout) still reads as `error`. Only its mean_ms is otherwise meaningful.
      name: "baseline",
      noVerdict: true,
      available: () => onPath("node"),
      // Run a prelude-timed copy under stock node, so exec_ms is measured at the
      // same execute-only boundary as the other runners. The baseline import
      // still stubs the taint prelude to no-ops.
      exec: (b, out, err, t) =>
        timeRun(
          ["node", "--import", BASELINE_IMPORT, timedBenchCopy(b)],
          {}, out, err, t,
        ),
    },
    // this project's analyzer, one runner per `@type` in TYPE_CONFIG (currently
    // just `dynajs-ta`, scoring taint benches; the `short` names it). Shares the
    // `dynajs` group so the confusion matrix can report per-runner AND combined
    // if more types are added. Analysis + flags come from the
    // bench's `@type` (see TYPE_CONFIG) unless overridden by
    // --analysis/--dynajs-flags. The chosen analysis must print
    // `@@DJX_VERDICT <actual> <expected>` per assert (e.g. the taint prelude's
    // __assert_taint__); else every run reads as a single error.
    ...Object.entries(TYPE_CONFIG).map(([type, cfg]) => ({
      name: `dynajs-${cfg.short}`,
      group: "dynajs",
      available: () => existsSync(path.join(REPO_ROOT, "dynajs")),
      applies: (b) => b.type === type && resolveDynajs(b, opts) != null,
      exec: (b, out, err, t) => {
        const { analysis, flags } = resolveDynajs(b, opts);
        // Run a prelude-timed copy. It lives outside the repo, so add its dir as
        // an include root (cwd is the only default) -> dynajs instruments it; the
        // prepended timer then measures execute-only (t0 at the bench body, after
        // instrumentation), matching the other runners' boundary.
        return timeRun(
          [path.join(REPO_ROOT, "dynajs"), "node", timedBenchCopy(b)],
          {
            DYNAJS_HOME: process.env.DYNAJS_HOME ?? REPO_ROOT,
            DYNAJS_OPTIONS:
              `--analysis=${analysis}${flags ? " " + flags : ""} --include ${benchCopyDir()}`,
          },
          out, err, t,
        );
      },
    })),

    // --- external analyzers ------------------------------------------------
    {
      // NodeMedic's taint engine under Jalangi2-babel instrumentation. Runs the
      // same bench files via the __set_taint__/__assert_taint__ ghost functions
      // registered in NodeMedic's src/GhostFunction.ts, so the default
      // @@DJX_VERDICT parser works -- but that registration is out-of-tree, so
      // GhostFunction.ts must be updated to the renamed __assert_taint__(v,
      // expected) and emit the 2-token marker for this runner to score. Only
      // taint benches apply. See the NODEMEDIC_* config block above.
      name: "nodemedic",
      applies: (b) => b.type === "taint",
      available: () =>
        existsSync(NODEMEDIC_JALANGI_CMD) && existsSync(NODEMEDIC_REWRITE),
      exec: (b, out, err, t) => {
        // Copy the bench into the CommonJS-scoped dir so Jalangi instruments it.
        // Key the copy on b.name (flattened relative path) so nested benches
        // sharing a basename don't clobber each other.
        const dest = path.join(nodemedicCjsDir(), `${b.name}.js`);
        writeFileSync(dest, withTiming(readFileSync(b.file, "utf8")));
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
    // --- multi-path replay (ExpoSE Distributor over the reach corpus) -------
    {
      // dynajs concolic AS ExpoSE's analyseScript (the restored drop-in).
      // ExpoSE's Distributor drives multi-path search: it spawns dynajs-play per
      // path, reads the alternatives() child inputs the analysis emits, and
      // re-queues them. A reach bench guards `throw "<REACH_SENTINEL>"` behind a
      // branch the seed does NOT take, so reaching it requires the search to
      // solve+replay an alternative input. Oracle (sat/unsat) from `@reach`.
      name: "dynajs-co-replay",
      group: "replay",
      applies: (b) => b.type === "concolic-replay",
      available: () =>
        existsSync(EXPOSE_ANALYSE) &&
        existsSync(EXPOSE_DYNAJS_PLAY) &&
        existsSync(path.join(REPO_ROOT, "dynajs")),
      exec: (b, out, err, t) =>
        timeRun(
          ["bash", EXPOSE_ANALYSE, b.file],
          {
            EXPOSE_PLAY_SCRIPT: "scripts/dynajs-play",
            DYNAJS_HOME: process.env.DYNAJS_HOME ?? REPO_ROOT,
            ...EXPOSE_REPLAY_ENV,
          },
          out, err, exposeBackstopMs(t),
          EXPOSE_HOME, // analyse sources scripts/env relative to its own root
        ),
      cases: reachCases,
    },
    {
      // Stock ExpoSE (its own Analyser + lib/S$) on the SAME reach corpus, for a
      // like-for-like multi-path comparison against dynajs-co-replay. No
      // EXPOSE_PLAY_SCRIPT -> the Distributor falls back to its own scripts/play.
      name: "expose-replay",
      group: "replay",
      applies: (b) => b.type === "concolic-replay",
      available: () => existsSync(EXPOSE_ANALYSE),
      exec: (b, out, err, t) =>
        timeRun(["bash", EXPOSE_ANALYSE, b.file], { ...EXPOSE_REPLAY_ENV },
          out, err, exposeBackstopMs(t), EXPOSE_HOME),
      cases: reachCases,
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
    reps: 1, // verdict-only default (verdicts are deterministic); pass --reps N for timing
    warmup: 0, // each rep is a fresh process, so warmup doesn't warm anything measured
    timeoutSec: 60,
    outputDir: null,
    runnerFilters: [],
    benchFilters: [],
    dirFilters: [], // restrict to benches under one or more subdirs of bench/micro
    check: false, // compare against the committed snapshot, exit non-zero on drift
    updateSnapshot: false, // (re)write the committed snapshot from this run
    repsSet: false, // whether --reps was passed (snapshot modes default reps to 1)
    onlyDone: false, // run only benches marked `// @done` (eye-verified)
    count: false, // just report how many benches match (+ breakdown), then exit
    coverage: false, // census of @done taint benches by area (BuiltIns/Syntax), then exit
    replay: false, // run ONLY the multi-path *-replay runners (reach corpus); default excludes them
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
      case "--dir": opts.dirFilters.push(need(i, a)); i++; break;
      case "--analysis": opts.analysis = need(i, a); i++; break;
      case "--dynajs-flags": opts.dynajsFlags = need(i, a); i++; break;
      case "--reps": opts.reps = Number(need(i, a)); opts.repsSet = true; i++; break;
      case "--warmup": opts.warmup = Number(need(i, a)); i++; break;
      case "--timeout": opts.timeoutSec = Number(need(i, a)); i++; break;
      case "--output-dir": opts.outputDir = need(i, a); i++; break;
      case "--check": opts.check = true; break;
      case "--update-snapshot": opts.updateSnapshot = true; break;
      case "--done": opts.onlyDone = true; break;
      case "--count": opts.count = true; break;
      case "--coverage": opts.coverage = true; break;
      case "--replay": opts.replay = true; break;
      case "--help":
        console.log(
          "Usage: node bench/run-micro-benchmark.mjs " +
            "[--runner NAME] [--bench NAME] [--dir SUB] [--analysis NAME] [--dynajs-flags STR] " +
            "[--reps N] [--warmup N] [--timeout SEC] [--output-dir DIR] " +
            "[--done] [--count] [--coverage] [--replay] [--check | --update-snapshot]",
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
  // `--dir SUB` keeps only benches whose path (relative to its bench root) is
  // under SUB, so a whole subtree runs without listing every basename (and
  // without the cross-folder collisions a basename `--bench` filter would pull
  // in). Applied within each root below.
  const dirPrefixes = opts.dirFilters.map((d) => d.replace(/[\\/]+$/, "").split(/[\\/]/).join(path.sep) + path.sep);
  // Walk each bench root (bench/micro always; bench/concolic if present) and
  // collect files with a `@type` header. The path relative to its root
  // (separators flattened to `__`) becomes the bench name, so nested benches
  // sharing a basename don't collide in the log and temp-copy filenames keyed
  // off it. The reach corpus uses distinct `_reach_` basenames, so names stay
  // unique across roots.
  for (const root of [BENCH_DIR, CONCOLIC_BENCH_DIR].filter(existsSync)) {
    const rootFiles = readdirSync(root, { recursive: true })
      // skip instrumentation artifacts: dynajs's `*__dynajs__.js` and ExpoSE's
      // Jalangi `*_jalangi_*.js` copies (both are emitted next to a bench when
      // the replay runners instrument it; neither is a bench).
      .filter((f) => f.endsWith(".js") && !f.endsWith("__dynajs__.js") && !f.includes("_jalangi_"))
      .filter((f) => !dirPrefixes.length || dirPrefixes.some((p) => f.startsWith(p)))
      .sort();
    for (const rel of rootFiles) {
      const file = path.join(root, rel);
      const meta = parseMeta(file);
      if (!meta) {
        console.error(`skip ${rel} (no \`// @type\` header)`);
        continue;
      }
      // `area`/`subarea` = the first / first-two path segments (e.g. `BuiltIns`,
      // `BuiltIns/Array`), so --coverage can tally @done progress by feature area.
      const segs = rel.split(/[\\/]/);
      const subarea = segs.length > 1 ? `${segs[0]}/${segs[1]}` : segs[0];
      benches.push({ file, name: stripExt(rel).replace(/[\\/]/g, "__"), area: segs[0], subarea, ...meta });
    }
  }
  if (opts.benchFilters.length)
    benches = benches.filter((b) => matchesAny(path.basename(b.file), opts.benchFilters));
  // `--done` keeps only eye-verified benches (those with a `// @done` header).
  if (opts.onlyDone) benches = benches.filter((b) => b.done);

  // --count: report how many benches match (honoring --dir/--bench/--done) with a
  // breakdown by @type/@target/@feature, then exit. The counting unit differs by
  // @type: a taint file chains several asserts, each an independently-scored case
  // (see VERDICT_RE/toCases), so taint is measured in ASSERTS; a concolic-replay
  // file is one reach probe, so it is measured in FILES only. assertsOf therefore
  // counts asserts for taint benches only. Reads only sources — no runner, no
  // build, no execution — a fast, side-effect-free census.
  if (opts.count) {
    const counted = benches;
    const assertsOf = new Map(); // bench -> taint asserts (0 for non-taint)
    for (const b of counted)
      assertsOf.set(b, b.type === "taint" ? assertOracles(b.file).length : 0);
    const totalAsserts = [...assertsOf.values()].reduce((a, c) => a + c, 0);
    console.log(`benchmarks: ${counted.length} files (taint asserts: ${totalAsserts})`);
    for (const [dim, label] of [["type", "@type"], ["target", "@target"], ["feature", "@feature"]]) {
      const files = new Map(), asserts = new Map();
      for (const b of counted) {
        const k = b[dim] || "(none)";
        files.set(k, (files.get(k) ?? 0) + 1);
        asserts.set(k, (asserts.get(k) ?? 0) + assertsOf.get(b));
      }
      console.log(`\nby ${label}:`);
      for (const k of [...files.keys()].sort()) {
        const a = asserts.get(k); // taint asserts; non-taint groups show none
        console.log(
          `  ${k.padEnd(16)}${String(files.get(k)).padStart(6)} files` +
            (a ? `${String(a).padStart(7)} asserts` : ""),
        );
      }
    }
    return;
  }

  // --coverage: a @done-progress census against the ECMAScript spec surface.
  // Counts METHODS — a "member" is the directory holding one method's benches
  // (e.g. BuiltIns/Set/prototype/add), done when every taint bench in it is
  // @done — and divides by the spec member universe (SPEC_BUILTIN_TOTAL) so the
  // denominator is the whole BuiltIn, not just the method folders that exist.
  // A subarea with no universe set (global, all Syntax) falls back to its
  // benched-member count, marked `*`. Concolic excluded. Sources only — no run.
  if (opts.coverage) {
    const taint = benches.filter((b) => b.type === "taint");
    const pct = (d, t) => (t === 0 ? "  n/a" : `${Math.round((d / t) * 100)}%`);
    // member dir -> { subarea, total benches, @done benches, weight }. weight =
    // how many spec/test262 units the member represents: BuiltIns members are
    // 1:1 with a spec member (weight 1); some Syntax members group several
    // test262 dirs into one folder (T262_MEMBER_WEIGHT), e.g. Operators/
    // arithmetic = +,-,*,/,% (weight 5). A member is "done" when all its taint
    // benches are @done, and is then credited its full weight.
    const members = new Map();
    for (const b of taint) {
      const dir = path.dirname(path.relative(BENCH_DIR, b.file));
      const e = members.get(dir) ?? {
        subarea: b.subarea, total: 0, done: 0, weight: T262_MEMBER_WEIGHT[dir] ?? 1,
      };
      e.total++;
      if (b.done) e.done++;
      members.set(dir, e);
    }
    // roll up to subarea: units covered by fully-@done members vs benched members
    const sub = new Map();
    for (const m of members.values()) {
      const e = sub.get(m.subarea) ?? { covered: 0, benched: 0 };
      e.benched++;
      if (m.done === m.total) e.covered += m.weight;
      sub.set(m.subarea, e);
    }
    // universe: BuiltIns -> ECMAScript spec members; Syntax -> test262 feature
    // dirs; neither set (e.g. global) -> fall back to benched members, marked `*`.
    const universeOf = (k) => SPEC_BUILTIN_TOTAL[k] ?? SYNTAX_T262_TOTAL[k];
    const rows = [...sub.keys()].sort().map((k) => {
      const { covered, benched } = sub.get(k);
      const u = universeOf(k);
      return { k, done: covered, denom: u ?? benched, fallback: u == null };
    });
    const line = (label, done, denom, fallback) =>
      `  ${label.padEnd(26)}${String(done).padStart(4)} / ${(denom + (fallback ? "*" : "")).padEnd(5)}${pct(done, denom).padStart(6)}`;
    console.log("coverage — @done coverage of the spec/test262 universe (taint only;");
    console.log("           BuiltIns vs ECMAScript spec members, Syntax vs test262 language");
    console.log("           feature dirs; * = no universe set -> denominator = benched members)\n");
    console.log("by subarea (covered / universe):");
    for (const r of rows) console.log(line(r.k, r.done, r.denom, r.fallback));
    // area totals (BuiltIns / Syntax); `*` if any subarea fell back
    const areas = new Map();
    for (const r of rows) {
      const a = r.k.split("/")[0];
      const e = areas.get(a) ?? { done: 0, denom: 0, fallback: false };
      e.done += r.done;
      e.denom += r.denom;
      e.fallback = e.fallback || r.fallback;
      areas.set(a, e);
    }
    console.log("\nby area (covered / universe):");
    for (const a of [...areas.keys()].sort()) {
      const { done, denom, fallback } = areas.get(a);
      console.log(line(a, done, denom, fallback));
    }
    return;
  }

  if (!benches.length)
    die(opts.onlyDone ? "no `// @done`-marked benchmarks matched" : "no benchmarks with a @type header matched");

  // Two scored corpora, reported in two different tables (see below):
  //   `@type taint`          -> dynajs-ta (+ nodemedic), confusion matrix
  //   `@type concolic-replay` -> dynajs-co-replay / expose-replay, reach table
  // Runners with no applicable bench are dropped below, so a filter that selects
  // only one corpus still produces a clean report.

  let runners = makeRunners(opts);
  // Separate the multi-path *-replay runners (the ExpoSE Distributor over the
  // bench/concolic reach corpus) from the default micro run: `--replay` selects
  // ONLY that group, the default excludes it. An explicit `--runner NAME`
  // bypasses this so any runner can still be named directly (e.g.
  // `--runner expose-replay` with no `--replay`).
  if (!opts.runnerFilters.length)
    runners = runners.filter((r) => (opts.replay ? r.group === "replay" : r.group !== "replay"));
  if (opts.runnerFilters.length)
    runners = runners.filter((r) => matchesAny(r.name, opts.runnerFilters));
  if (!runners.length) die("no runners matched the requested filters");

  const active = [];
  for (const r of runners) {
    if (!r.available()) {
      console.error(`skip runner ${r.name} (not available on PATH)`);
      continue;
    }
    // Drop runners with no applicable bench — e.g. the replay runners when the
    // filter selects only taint benches — so the report has no dead all-zero rows.
    if (r.applies && !benches.some((b) => r.applies(b))) {
      console.error(`skip runner ${r.name} (no applicable benchmarks)`);
      continue;
    }
    active.push(r);
  }
  if (!active.length) die("no runners available");

  const ts = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14);
  const outputDir = opts.outputDir ?? path.join(REPO_ROOT, "bench/results", `micro-${ts}`);
  const logsDir = path.join(outputDir, "logs");
  mkdirSync(logsDir, { recursive: true });
  const csvFile = path.join(outputDir, "results.csv");
  writeFileSync(csvFile, "runner,benchmark,type,target,feature,rep,case,expected,actual,result,exit_code,timed_out,elapsed_ms,exec_ms,runs\n");

  console.log(`Output directory: ${outputDir}`);
  console.log(`Runners: ${active.map((r) => r.name).join(", ")}`);
  console.log(
    `Benchmarks: ${benches.length} files` +
      `   reps: ${opts.reps}   warmup: ${opts.warmup}   timeout: ${opts.timeoutSec}s\n`,
  );
  console.log(
    "runner".padEnd(12) + "benchmark".padEnd(24) + "expected".padEnd(10) +
      "actual".padEnd(10) + "result".padStart(7) + "mean_ms".padStart(10) +
      "exec_ms".padStart(10) + "runs".padStart(9),
  );

  // Per-bench outcomes, kept so the report can slice them any number of ways
  // (overall, by @target, by @feature). records[runner] = [{ bench, cases:
  // [{actual, expected, result}], anyTimeout, mean }, ...]; counts are per case.
  const records = {};
  for (const r of active) records[r.name] = [];

  // Each marker is one assert case; a run with no marker (crash/timeout before
  // any assert fires) errored as a whole. Don't collapse it to a single `error`
  // case — that under-counts a multi-assert file and makes the run's total drift
  // below the assertion census (--count). Instead synthesize one `error` case
  // per declared assertion, each carrying its own oracle (detected/clean), so a
  // taint file's total still matches its assert count. (The reach runners never
  // reach this fallback — reachCases always returns exactly one case.)
  const toCases = (raw, b) => {
    if (raw.length) return raw;
    const oracles = assertOracles(b.file);
    const toExpected = (o) => (o === false ? "clean" : "detected");
    if (oracles.length)
      return oracles.map((o) => ({ actual: "error", expected: toExpected(o) }));
    return [{ actual: "error", expected: toExpected(oracles[0]) }];
  };
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
      const execSamples = [];
      const runsSamples = [];
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
        // A `noVerdict` runner (baseline) is not a detector: its missing marker
        // is structural, not a crash. On a clean exit, relabel the synthesized
        // `error` to `none` so it still scores FP/FN (classify treats any
        // non-clean/non-detected actual that way) but isn't counted in the
        // `err` column as if it had crashed. A real crash keeps `error`.
        if (r.noVerdict && run.code === 0 && !run.timedOut)
          for (const c of cases) if (c.actual === "error") c.actual = "none";
        samples.push(run.ms);
        const exec = execMs(run);
        if (Number.isFinite(exec)) execSamples.push(exec);
        const runs = pathRuns(run);
        if (Number.isFinite(runs)) runsSamples.push(runs);
        sigs.push(sig(cases));
        if (run.timedOut) anyTimeout = true;
        if (rep === 1) firstCases = cases;
        cases.forEach((c, i) =>
          appendFileSync(
            csvFile,
            `${r.name},${b.name},${b.type},${b.target},${b.feature},${rep},${i},${c.expected},${c.actual},${classify(c.expected, c.actual)},${run.code},${run.timedOut},${run.ms.toFixed(1)},${Number.isFinite(exec) ? exec.toFixed(3) : ""},${Number.isFinite(runs) ? runs : ""}\n`,
          ),
        );
      }

      // Cases should be deterministic across reps; warn if not, use rep 1.
      if (sigs.some((s) => s !== sigs[0]))
        console.error(`warn ${r.name}/${b.name}: inconsistent cases across reps: ${sigs.join(" | ")}`);

      const cases = firstCases.map((c) => ({ ...c, result: classify(c.expected, c.actual) }));
      const mean = samples.reduce((a, c) => a + c, 0) / samples.length;
      // in-process body execution time, bootstrap+instrument excluded. Take the
      // MIN across reps: timing noise (scheduling, GC) is one-sided positive, so
      // the fastest rep is closest to the true cost. NaN if no rep reached the
      // timing tail (timeout / uncaught throw before the last line).
      const execMin = execSamples.length ? Math.min(...execSamples) : NaN;
      // program executions to reach (the *-replay runners). MIN across reps: the
      // concurrent worker pool overshoots by a few paths before the reach halts
      // it, so the fewest observed is closest to the true reach depth. NaN for
      // non-replay runners (they never print the `N paths` tally).
      const runsMin = runsSamples.length ? Math.min(...runsSamples) : NaN;
      records[r.name].push({ bench: b, cases, anyTimeout, mean, execMin, runsMin });

      cases.forEach((c, i) => {
        const tag = cases.length > 1 ? `${b.name}[${i}]` : b.name;
        console.log(
          r.name.padEnd(12) + tag.padEnd(24) + c.expected.padEnd(10) +
            c.actual.padEnd(10) + colorResult(c.result, c.result.padStart(7)) +
            (i === 0 ? mean.toFixed(1).padStart(10) : "") +
            (i === 0 ? (Number.isFinite(execMin) ? execMin.toFixed(2) : "n/a").padStart(10) : "") +
            (i === 0 ? (Number.isFinite(runsMin) ? String(runsMin) : "n/a").padStart(9) : ""),
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

  // One report block: an overall row per source (each runner plus its combined
  // `... (all)` group row), then the same sliced by classification dimension —
  // for each source, group its records by @target/@feature/@type and print a
  // sub-row per value. Shared by both corpora; they differ only in the
  // header/row formatter (confusion matrix vs reach table).
  const report = (sources, dims, headerFn, rowFn) => {
    console.log(headerFn("runner"));
    for (const s of sources) console.log(rowFn(s.label, buildMatrix(s.recs)));
    for (const [dim, label] of dims) {
      console.log(`\nBy ${label}:`);
      console.log(headerFn("runner / " + label));
      for (const s of sources) {
        const groups = new Map();
        for (const rec of s.recs) {
          const key = rec.bench[dim] || "(none)";
          (groups.get(key) ?? groups.set(key, []).get(key)).push(rec);
        }
        for (const key of [...groups.keys()].sort())
          console.log(rowFn(`  ${s.label} / ${key}`, buildMatrix(groups.get(key))));
      }
    }
  };

  // Split runners by report style: taint -> confusion matrix (precision/recall);
  // concolic-replay -> reach table (PASS/FAIL/accuracy/paths/time). Each corpus
  // is reported only when it has active runners, so a single-corpus filter still
  // prints just the one table.
  const taintActive = active.filter((r) => r.group !== "replay");
  const replayActive = active.filter((r) => r.group === "replay");

  if (taintActive.length) {
    console.log("\nConfusion matrix & precision/recall (errors counted as FN/FP):");
    report(
      matrixSources(taintActive, records),
      [["target", "@target"], ["feature", "@feature"], ["type", "@type"]],
      matrixHeader, matrixRow,
    );
  }
  if (replayActive.length) {
    console.log("\nReach search — multi-path (PASS = reached correctly; errors count as FAIL):");
    report(
      matrixSources(replayActive, records),
      [["target", "@target"], ["feature", "@feature"]],
      reachHeader, reachRow,
    );
  }

  console.log(`\nCSV: ${csvFile}`);
}

main();