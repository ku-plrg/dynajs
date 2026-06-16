import { writeFileSync } from 'node:fs';
import { FlowAnalysis, type Valued, type InfoDomain } from '@/model/index.js';
import { type Sym, type Sort, seqElementSort, containsLost, symToString } from '@shared/sym.js';
import { solveValidity, solveModel } from './smt.js';
import { installPrelude } from './prelude.js';

declare const D$: { analysis: ConcolicAnalysis } & Record<string, any>;

const GHOSTS = installPrelude();

// A branch actually taken during concrete execution: `constraint` is the
// symbolic form of the condition, `taken` whether it was truthy. Together these
// form the path condition leading up to a __symbolic_assert__. `binder` marks a
// constraint the engine introduced itself rather than a real branch — a symbolic
// array's `length >= 0` and the `0 <= i < length` element-access bounds (ExpoSE's
// SymbolicState binder PCs): part of the conjunction, but never flipped to spawn
// an alternative input.
type PathConstraint = { id: number; constraint: Sym; taken: boolean; binder?: boolean };

// Per-symbolic-array bookkeeping kept off the Info (which holds the live sequence
// expression: a `var` initially, a `seqConcat`/`seqExtract` after push/pop). The
// element sort is fixed at creation from the seed's first element and is what a
// push must type-match (ExpoSE wipes the symbolic array on a mismatched push).
type ArrayMeta = { elemSort: Sort };

// Per-symbolic-object bookkeeping. Fields are minted lazily on first read and
// cached so repeated reads return the same symbol (ExpoSE's SymbolicObject).
type ObjectMeta = { name: string; counter: number; fields: Map<string, Sym> };

// We build on FlowAnalysis purely for its identity-based wrapping: every value
// (incl. primitives) is a uniquely-wrapped object tracked by symbol id, so two
// distinct literal `2`s are distinct entries — no value-keyed aliasing. The
// symbolic expression for a value is stored as its `Info` (= Sym), built up
// purely through the op-aware Info hooks (binaryInfo/unaryInfo/lengthInfo/
// substringInfo/concatenateInfo/truncateInfo/conditionInfo and, for symbolic
// arrays/objects, getFieldInfo + opaqueCallInfo) — no `Analysis` method
// overrides, no frame types. Both user-code ops (via the instrumenter) and
// model/polyfill ops (via `$`) funnel through these same hooks.
export class ConcolicAnalysis extends FlowAnalysis<Sym | undefined> {
  result: unknown;
  private pathConstraints: PathConstraint[] = [];

  // Symbolic arrays/objects, keyed by the (identity-stable) container object.
  // A symbolic array additionally carries its live sequence Sym as its `Info`;
  // a symbolic object carries no Info and is recognised solely by membership.
  private arrayMeta = new WeakMap<object, ArrayMeta>();
  private objectMeta = new WeakMap<object, ObjectMeta>();

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
  // read), so it builds no real structure — every genuine symbolic value comes
  // from the op-aware hooks (which run first). Reaching baseInfo with a SYMBOLIC
  // parent therefore means a symbolic value flowed through an op with no model:
  // information loss, marked `lost`. (Unscoped on purpose: this also fires inside
  // modeled builtins' internal fallbacks, so a model that bails to baseInfo taints
  // its result — whether that is desirable for padStart/startsWith/indexOf is
  // under review. A purely concrete op stays inert.)
  protected baseInfo(_value: unknown, parents: Valued<Sym>[]): Sym | undefined {
    return parents.some((p) => p.info !== undefined) ? { kind: 'lost' } : undefined;
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
  protected lengthOfStringInfo(s: Valued<Sym>): Sym | undefined {
    const src = this.symOf(s);
    if (src.kind === 'const') return undefined;
    return { kind: 'strlen', src };
  }

  // A non-string field read `base[prop]`. Two symbolic sources:
  //  - symbolic object: lazily mint (and cache) a fresh symbol for the field,
  //    ExpoSE SymbolicObject. The sort is inferred from the field's concrete
  //    value (an unseeded field is `undefined` -> Int, concolic's default).
  //  - symbolic array (base.info is the live sequence Sym): `.length` -> arrlen,
  //    an integer index -> a `select`, guarding the read with `0 <= i < length`
  //    (ExpoSE symbolicField). A symbolic index keeps its symbolic form.
  protected getFieldInfo(base: Valued<Sym>, prop: Valued<Sym>, result: Valued<Sym>): Sym | undefined {
    const container = base.value;
    if (container === null || typeof container !== 'object') return undefined;

    const obj = this.objectMeta.get(container);
    if (obj !== undefined) {
      const key = String(prop.value);
      let sym = obj.fields.get(key);
      if (sym === undefined) {
        sym = { kind: 'var', name: `${obj.name}_${key}_${obj.counter++}`, sort: this.scalarSort(result.value) };
        obj.fields.set(key, sym);
      }
      return sym;
    }

    const arr = base.info;
    if (this.arrayMeta.has(container) && arr !== undefined) {
      if (prop.value === 'length') return { kind: 'arrlen', arr };
      const index = this.arrayIndex(prop);
      if (index !== undefined) {
        const length: Sym = { kind: 'arrlen', arr };
        this.pushConstraint(
          {
            kind: 'binary',
            op: '&&',
            left: { kind: 'binary', op: '>=', left: index, right: { kind: 'const', value: 0 } },
            right: { kind: 'binary', op: '<', left: index, right: length },
          },
          true,
        );
        return { kind: 'select', arr, index };
      }
    }
    return undefined;
  }

  // An opaque (native) call on a symbolic array. We model exactly the operations
  // ExpoSE's ArrayModels covers; any other native is a NoOp (the array keeps its
  // current symbolic expression, which then goes stale through an unmodeled
  // mutation — the same gap ExpoSE NoOps). `entries[0]` is the receiver array.
  protected opaqueCallInfo(f: unknown, entries: unknown[], _result: unknown): Sym | undefined {
    const base = entries[0];
    if (base === null || typeof base !== 'object') return undefined;
    const meta = this.arrayMeta.get(base);
    if (meta === undefined) return undefined;
    const arr = this.getInfo(base);
    if (arr === undefined) return undefined;

    if (f === Array.prototype.push) {
      const arg = this.valued(entries[1]);
      // A type-mismatched push wipes the symbolic array (ExpoSE bug28): from here
      // on the array is concrete, so drop both its sequence Info and its meta.
      if (typeof arg.value !== this.elemTypeof(meta.elemSort)) {
        this.setInfo(base, undefined);
        this.arrayMeta.delete(base);
        return undefined;
      }
      const grown: Sym = { kind: 'seqConcat', left: arr, right: { kind: 'seqUnit', elem: this.symOf(arg) } };
      this.setInfo(base, grown);
      return { kind: 'arrlen', arr: grown }; // push returns the new length
    }

    if (f === Array.prototype.pop) {
      const lastIndex: Sym = { kind: 'binary', op: '-', left: { kind: 'arrlen', arr }, right: { kind: 'const', value: 1 } };
      this.setInfo(base, { kind: 'seqExtract', src: arr, offset: { kind: 'const', value: 0 }, length: lastIndex });
      return { kind: 'select', arr, index: lastIndex }; // the removed last element
    }

    if (f === Array.prototype.indexOf) {
      const sub: Sym = { kind: 'seqUnit', elem: this.symOf(this.valued(entries[1])) };
      return { kind: 'seqIndexOf', arr, sub, from: { kind: 'const', value: 0 } };
    }

    if (f === Array.prototype.includes) {
      const sub: Sym = { kind: 'seqUnit', elem: this.symOf(this.valued(entries[1])) };
      return { kind: 'seqContains', arr, sub };
    }

    if (f === Array.prototype.join) return this.joinSym(base, arr, entries[1], meta);

    return undefined;
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
    // A constant branch carries no constraint; a `lost` one we cannot express, so
    // we drop it (the branch already ran concretely) — the path condition is then
    // weaker, never wrong. Matches ExpoSE, which concretizes such a branch to a
    // vacuous `true`.
    if (sym.kind !== 'const' && !containsLost(sym)) {
      this.pathConstraints.push({ id, constraint: sym, taken });
    }
  }

  // The symbolic expression for an operand: its attached Info, else a constant of
  // its concrete value.
  private symOf(v: Valued<Sym>): Sym {
    return v.info ?? { kind: 'const', value: v.value };
  }

  // Record an engine-introduced constraint (taken on the concrete path) — never a
  // real branch, so it is tagged `binder` and excluded from alternative-input
  // generation. Synthetic constraints carry the sentinel id -1.
  private pushConstraint(constraint: Sym, binder = false): void {
    this.pathConstraints.push({ id: -1, constraint, taken: true, binder });
  }

  // The scalar SMT sort concolic models a concrete value with (its two scalar
  // sorts, plus Bool); the seq sort whose elements are that scalar; and the JS
  // `typeof` those elements have (for the push type-match check).
  private scalarSort(v: unknown): Sort {
    if (typeof v === 'string') return 'String';
    if (typeof v === 'boolean') return 'Bool';
    return 'Int';
  }
  private seqSortOf(elem: unknown): Sort {
    switch (this.scalarSort(elem)) {
      case 'String': return 'StringSeq';
      case 'Bool': return 'BoolSeq';
      default: return 'IntSeq';
    }
  }
  private elemTypeof(seqSort: Sort): string {
    switch (seqElementSort(seqSort)) {
      case 'String': return 'string';
      case 'Bool': return 'boolean';
      default: return 'number';
    }
  }

  // The array index a property key denotes, as a Sym, or undefined if `prop` is
  // not a non-negative integer index (e.g. `length`, a method name). A symbolic
  // index keeps its symbolic form; a concrete one becomes a const.
  private arrayIndex(prop: Valued<Sym>): Sym | undefined {
    const raw = prop.value;
    let n: number;
    if (typeof raw === 'number') n = raw;
    else if (typeof raw === 'string') {
      n = Number(raw);
      if (String(n) !== raw) return undefined;
    } else return undefined;
    if (!Number.isInteger(n) || n < 0) return undefined;
    return prop.info ?? { kind: 'const', value: n };
  }

  // Array.prototype.join over a symbolic string array: unfold across the concrete
  // length into nested string concatenations of the (symbolic) elements and the
  // separator (ExpoSE join). Only string-element arrays are modeled; others
  // concretize (undefined). `sepArg` is the separator argument (undefined -> ",").
  private joinSym(base: object, arr: Sym, sepArg: unknown, meta: ArrayMeta): Sym | undefined {
    if (seqElementSort(meta.elemSort) !== 'String') return undefined;
    const n = (base as unknown[]).length;
    if (n === 0) return { kind: 'const', value: '' };
    const sepValue = sepArg === undefined ? undefined : this.valued(sepArg).value;
    const sep: Sym = { kind: 'const', value: sepValue === undefined ? ',' : String(sepValue) };
    const at = (i: number): Sym => ({ kind: 'select', arr, index: { kind: 'const', value: i } });
    let acc = at(0);
    for (let i = 1; i < n; i++) {
      acc = { kind: 'concat', left: { kind: 'concat', left: acc, right: sep }, right: at(i) };
    }
    return acc;
  }

  // --- prelude entry points ------------------------------------------------

  // Introduce symbolic variable `name`, returning a wrapped value the program
  // runs concretely on. Replay (M3): if the Distributor's seed input carries a
  // concrete for this variable (a child input from a negated branch), drive
  // execution with THAT value so we follow the intended path; otherwise keep the
  // program's own seed. `make` then mints a fresh value tagged with its symbolic
  // form, dispatched on the concrete's shape:
  //   - array  -> a `(Seq T)` variable (T from the seed's first element); reads
  //     of `.length`/elements become symbolic via getFieldInfo, and the array's
  //     length is constrained non-negative (ExpoSE).
  //   - object -> a symbolic object whose fields are minted lazily on read.
  //   - scalar -> a `var` of String (string seed) or Int (the default sort).
  // Array/object replay inputs don't round-trip the scalar SMT model parser, so
  // only the scalar case is re-seeded from a child input.
  makeSymbolic(name: unknown, seed: unknown): unknown /* Wrapped */ {
    const varName = String(this.valued(name).value);
    const input = this.seedInput();
    const concrete = varName in input ? input[varName] : this.valued(seed).value;

    if (Array.isArray(concrete)) {
      // Array elements are still individually wrapped (only the array itself was
      // unwrapped), so project the first through `valued` to read its type.
      const sort = this.seqSortOf(concrete.length ? this.valued(concrete[0]).value : undefined);
      const arrSym: Sym = { kind: 'var', name: varName, sort };
      this.arrayMeta.set(concrete, { elemSort: sort });
      this.pushConstraint(
        { kind: 'binary', op: '>=', left: { kind: 'arrlen', arr: arrSym }, right: { kind: 'const', value: 0 } },
        true,
      );
      return this.make(concrete, arrSym);
    }
    if (concrete !== null && typeof concrete === 'object') {
      this.objectMeta.set(concrete, { name: varName, counter: 0, fields: new Map() });
      return this.make(concrete);
    }
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
    if (sym.kind === 'const' || containsLost(sym)) {
      // No symbolic dependency, OR the condition rests on a value lost to an
      // unmodeled op. For a fair single-path comparison we DON'T error on loss
      // (for now): we fall back to the concrete truth value, as ExpoSE does.
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
      if (pcs[i].binder) continue; // engine-introduced (bounds/length>=0): never flipped
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
