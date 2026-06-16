import { writeFileSync } from 'node:fs';
import { FlowAnalysis, type Valued, type InfoDomain } from '@/model/index.js';
import { type Sym, type Sort, symToString } from '@shared/sym.js';
import { solveValidity, solveModel } from './smt.js';
import { installPrelude } from './prelude.js';

declare const D$: { analysis: ConcolicAnalysis } & Record<string, any>;

const GHOSTS = installPrelude();

// A branch actually taken during concrete execution: `constraint` is the
// symbolic form of the condition, `taken` whether it was truthy. Together these
// form the path condition leading up to a __symbolic_assert__.
type PathConstraint = { id: number; constraint: Sym; taken: boolean };

// We build on FlowAnalysis purely for its identity-based wrapping: every value
// (incl. primitives) is a uniquely-wrapped object tracked by symbol id, so two
// distinct literal `2`s are distinct entries — no value-keyed aliasing. The
// symbolic expression for a value is stored as its `Info` (= Sym), built up
// purely through the op-aware Info hooks (binaryInfo/unaryInfo/lengthInfo/
// substringInfo/concatenateInfo/truncateInfo/conditionInfo) — no `Analysis`
// method overrides, no frame types. Both user-code ops (via the instrumenter)
// and model/polyfill ops (via `$`) funnel through these same hooks.
export class ConcolicAnalysis extends FlowAnalysis<Sym | undefined> {
  result: unknown;
  private pathConstraints: PathConstraint[] = [];

  // The prelude ghosts (__symbolic__/__symbolic_assert__) stay transparent so
  // they receive wrapped values; every other uncontrolled callee (natives,
  // uninstrumented JS) is opaque per the framework default, so wrapped
  // primitives are stripped before they reach native code.
  protected transparentCalls = GHOSTS;

  domain: InfoDomain<Sym | undefined> = {
    getBottom: () => undefined,
    isBottom: (info): info is undefined => info === undefined,
  };

  // baseInfo is operator-unaware (it can't tell `.length` from any other field
  // read), so concolic builds NO flow-through info here — every symbolic value
  // comes from the op-aware hooks below (the framework routes `.length` to
  // lengthInfo, `s[i]` to substringInfo, etc.). Stays inert.
  protected baseInfo(): Sym | undefined {
    return undefined;
  }

  // The model routes string-builtin results (charAt/slice/substring/...) and the
  // `s[i]` char-access through these hooks, so they DO carry symbolic structure.
  protected substringInfo(
    src: Valued<Sym>,
    start: number,
    resultLength: number,
  ): Sym | undefined {
    // Non-symbolic source -> result has no symbolic dependency.
    if (src.info === undefined) return undefined;
    return { kind: 'substr', src: src.info, start, length: resultLength };
  }

  protected concatenateInfo(
    left: Valued<Sym>,
    _leftLength: number,
    right: Valued<Sym>,
    _rightLength: number,
  ): Sym | undefined {
    // `Valued` carries each side's concrete value, so a non-symbolic side is
    // reconstructed as a string constant (via `symOf`) rather than dropped — the
    // common `sym + "literal"` shape (str.++ s "literal"). Same as binaryInfo: no
    // node when both sides are constant.
    const l = this.symOf(left);
    const r = this.symOf(right);
    if (l.kind === 'const' && r.kind === 'const') return undefined;
    return { kind: 'concat', left: l, right: r };
  }

  // Arithmetic (`+ - * / …`) or ordering comparison (`< <= > >=`), from user code
  // OR a generated model — both funnel here. Build the operator Sym; a
  // non-symbolic side keeps its constant via `symOf`, two constants -> no node
  // (keeps it out of the path condition). A `+` reaching here is numeric — string
  // `+` is split to concatenate upstream (applyBinary step 1c / codegen).
  protected binaryInfo(op: string, l: Valued<Sym>, r: Valued<Sym>): Sym | undefined {
    const left = this.symOf(l);
    const right = this.symOf(r);
    if (left.kind === 'const' && right.kind === 'const') return undefined;
    return { kind: 'binary', op, left, right };
  }

  protected unaryInfo(op: string, x: Valued<Sym>): Sym | undefined {
    const operand = this.symOf(x);
    if (operand.kind === 'const') return undefined;
    return { kind: 'unary', op, operand };
  }

  // `s.length` — both user-code `.length` and model-side `$.length` route here:
  // a symbolic string's length stays symbolic as a strlen node.
  protected lengthInfo(s: Valued<Sym>): Sym | undefined {
    const src = this.symOf(s);
    if (src.kind === 'const') return undefined;
    return { kind: 'strlen', src };
  }

  // ToIntegerOrInfinity truncate: keep a symbolic numeric operand symbolic across
  // the integer coercion (identity in concolic's Int domain).
  protected truncateInfo(x: Valued<Sym>): Sym | undefined {
    const src = this.symOf(x);
    if (src.kind === 'const') return undefined;
    return { kind: 'truncate', src };
  }

  // A branch (user-code `if`/`&&`/… via D$.C, or a model-internal bound check via
  // $.condition) was taken. If its condition is symbolic, record it as a path
  // constraint; the concrete `taken` direction fixes its polarity. Both branch
  // sources funnel here through FlowAnalysis.condition.
  protected conditionInfo(id: number, cond: Valued<Sym>, taken: boolean): void {
    const sym = this.symOf(cond);
    if (sym.kind !== 'const') {
      this.pathConstraints.push({ id, constraint: sym, taken });
    }
  }

  // The symbolic expression for an operand: its attached Info, else a constant of
  // its concrete value.
  private symOf(v: Valued<Sym>): Sym {
    return v.info ?? { kind: 'const', value: v.value };
  }

  // --- prelude entry points ------------------------------------------------

  // Introduce symbolic variable `name`, returning a wrapped value the program
  // runs concretely on. Replay (M3): if the Distributor's seed input carries a
  // concrete for this variable (a child input from a negated branch), drive
  // execution with THAT value so we follow the intended path; otherwise keep the
  // program's own seed. Either way `make` mints a fresh value tagged with the
  // `var` Info — the concrete's type fixes the SMT sort (string -> String, else
  // Int, the only two sorts we translate).
  makeSymbolic(name: unknown, seed: unknown): unknown {
    const varName = String(this.valued(name).value);
    const input = this.seedInput();
    const concrete = varName in input ? input[varName] : this.valued(seed).value;
    const sort: Sort = typeof concrete === 'string' ? 'String' : 'Int';
    return this.make(concrete, { kind: 'var', name: varName, sort });
  }

  symbolicAssert(condArg: unknown, expectedArg: unknown): void {
    // `expected` is the per-assert ground truth (true = should be detected). We
    // print `@@DJX_VERDICT <actual> <expected>` so the runner classifies each
    // assert as TP/FP/FN/TN on its own, with no file-level oracle header.
    const expected = this.valued(expectedArg).value ? 'detected' : 'clean';
    const emit = (actual: 'detected' | 'clean' | 'error') =>
      console.log(`@@DJX_VERDICT ${actual} ${expected}`);

    const cond = this.valued(condArg);
    const sym = this.symOf(cond);
    if (sym.kind === 'const') {
      // No symbolic dependency: the assert reduces to its concrete truth value.
      emit(cond.value ? 'detected' : 'clean');
      return;
    }
    let verdict: 'valid' | 'invalid' | 'unknown';
    try {
      verdict = solveValidity(this.pathConstraints, sym);
    } catch (e) {
      console.error(`[concolic] assert unsolved: ${(e as Error).message}`);
      emit('error'); // unsolved is its own verdict; classifies as FN/FP by expected
      return;
    }
    console.error(
      `[concolic] assert ${symToString(sym)} under ${this.pathConstraints.length} ` +
        `constraint(s) -> ${verdict}`,
    );
    emit(verdict === 'valid' ? 'detected' : 'clean');
  }

  endExecution() {
    D$.analysis.result = {
      pathConstraints: this.pathConstraints.map((p) => ({
        id: p.id,
        taken: p.taken,
        constraint: symToString(p.constraint),
      })),
    };
    this.writeExpoSEResult();
  }

  // ExpoSE drop-in: run as ExpoSE's analyseScript, the Distributor spawns us with
  // a seed input on argv and reads two result files on exit (Spawn.js + the
  // SymbolicExecution exitFn). We honour that contract: EXPOSE_OUT_PATH gets
  // { pc, input, errors, alternatives, stats }, EXPOSE_COVERAGE_PATH the coverage
  // map. `alternatives` are the negated-branch child inputs the Distributor
  // re-queues to drive multi-path search (M2); coverage stays empty until M4.
  // Without the env vars (e.g. the microbench) this is a no-op; the @@DJX_VERDICT
  // path is untouched.
  private writeExpoSEResult(): void {
    const outPath = process.env.EXPOSE_OUT_PATH;
    if (!outPath) return;
    // `stats` is a JSON *string* (ExpoSE Stats.export() = JSON.stringify(data);
    // the Distributor re-parses it via Stats.merge). An empty run serialises to "{}".
    writeFileSync(
      outPath,
      JSON.stringify({
        pc: this.pcToString(this.pathConstraints),
        input: this.seedInput(),
        errors: [],
        alternatives: this.alternatives(),
        stats: JSON.stringify({}),
      }),
    );
    const covPath = process.env.EXPOSE_COVERAGE_PATH;
    if (covPath) writeFileSync(covPath, JSON.stringify({}));
  }

  // Readable path-condition rendering (ExpoSE _stringPC analogue; only the `pc`
  // display field, not parsed by the Distributor).
  private pcToString(cs: readonly { constraint: Sym; taken: boolean }[]): string {
    return cs.map((p) => `${p.taken ? '' : '¬'}${symToString(p.constraint)}`).join(', ');
  }

  // Child inputs for the unexplored side of each branch (ExpoSE
  // SymbolicState.alternatives/_buildPC). From `_bound` onward, negate branch i
  // while holding branches [0..i-1] at their taken polarity, solve for a model,
  // and emit it as a child input tagged `_bound = i+1` (a re-run then fixes the
  // prefix and explores past i). The Distributor re-queues these
  // (Center._expandAlternatives) — that is how multi-path search proceeds. A
  // branch we can't translate or that is infeasible is skipped, not fatal.
  private alternatives(): { input: Record<string, unknown>; pc: string; forkIid: number }[] {
    const bound =
      typeof this.seedInput()._bound === 'number' ? (this.seedInput()._bound as number) : 0;
    const pcs = this.pathConstraints;
    const out: { input: Record<string, unknown>; pc: string; forkIid: number }[] = [];
    for (let i = bound; i < pcs.length; i++) {
      const branches = [...pcs.slice(0, i), { constraint: pcs[i].constraint, taken: !pcs[i].taken }];
      let model;
      try {
        model = solveModel(branches);
      } catch {
        continue; // unsupported op in this branch -> can't flip
      }
      if (!model) continue; // negated branch infeasible under the prefix
      const input: Record<string, unknown> = Object.fromEntries(model);
      input._bound = i + 1;
      out.push({ input, pc: this.pcToString(branches), forkIid: pcs[i].id });
    }
    return out;
  }

  // The seed input the Distributor replayed (last argv entry — the ExpoSE
  // convention; see Analyser.js): named symbolic values + a `_bound`. Cached; a
  // fresh unbounded seed when absent or unparseable (argv tail is the target path).
  private _seed?: Record<string, unknown>;
  private seedInput(): Record<string, unknown> {
    if (this._seed) return this._seed;
    let seed: Record<string, unknown> = { _bound: 0 };
    const raw = process.argv[process.argv.length - 1];
    try {
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed && typeof parsed === 'object') seed = parsed as Record<string, unknown>;
    } catch {
      /* not JSON -> fresh seed */
    }
    return (this._seed = seed);
  }
}

D$.analysis = new ConcolicAnalysis();
