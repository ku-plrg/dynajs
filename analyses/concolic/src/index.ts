import { writeFileSync } from 'node:fs';
import { FlowAnalysis, type Valued } from '../../flow/index.js';
import {
  type Sym,
  type Sort,
  seqElementSort,
  sortOf,
  sortsComparable,
  isNumericSort,
  symToString,
} from './sym.js';
import {
  solveValidity,
  solveModel,
  solveSat,
  ARRAY_READBACK_BOUND,
} from './smt.js';
import { installPrelude } from './prelude.js';
import { Coverage } from './coverage.js';

declare const D$: { analysis: ConcolicAnalysis } & Record<string, any>;

const GHOSTS = installPrelude();

type PathConstraint = {
  id: number;
  constraint: Sym;
  taken: boolean;
  binder?: boolean;
};
type ArrayMeta = { elemSort: Sort; lenSym: Sym };
type ObjectMeta = { name: string; counter: number; fields: Map<string, Sym> };

export class ConcolicAnalysis extends FlowAnalysis<Sym | undefined> {
  result: unknown;
  private pathConstraints: PathConstraint[] = [];
  private errors: { error: string; stack?: string }[] = [];

  // Statement coverage for the ExpoSE drop-in only (gated on the env the
  // Distributor's Spawn.js sets); the single-path microbench leaves it undefined
  // so its hot hooks below stay no-ops.
  private cov = process.env.EXPOSE_COVERAGE_PATH ? new Coverage() : undefined;

  private arrayMeta = new WeakMap<object, ArrayMeta>();
  // Array var name -> its element seq sort, for re-seeding (see materializeArrayInputs).
  // Keyed by name (not the concrete object) because alternatives() works from a solved
  // model's variable names, after the seed object is gone.
  private arrayVars = new Map<string, Sort>();
  private objectMeta = new WeakMap<object, ObjectMeta>();
  private regexVarCounter = 0;
  private arrayOpCounter = 0;

  protected transparentCalls = GHOSTS;

  domain = {
    getBottom: () => undefined,
    isBottom: (info: Sym | undefined): info is undefined => info === undefined,
  };

  protected defaultInfo(
    _value: unknown,
    _parents: Valued<Sym>[],
  ): Sym | undefined {
    return undefined;
  }

  protected substringInfo(
    src: Valued<Sym>,
    start: Valued<Sym, number>,
    end: Valued<Sym, number>,
    resultLength: number,
  ): Sym | undefined {
    if (src.info === undefined) return undefined;
    // The window is [start, end), so its length is end - start. When either
    // bound is symbolic — an open-ended slice/substring whose end is the symbolic
    // string length (slice(1), substring(1)), an end clamped to len
    // (substring(0, 100)), or a char access at a computed index — carry the
    // bounds (and hence the length) symbolically. Pinning length to the seed's
    // concrete result length would make any query needing a different-length
    // subject (slice(1) === 'bcd') unsatisfiable.
    if (start.info === undefined && end.info === undefined) {
      return {
        kind: 'substr',
        src: src.info,
        start: start.value,
        length: resultLength,
      };
    }
    const startSym: Sym = start.info ?? { kind: 'const', value: start.value };
    const endSym: Sym = end.info ?? { kind: 'const', value: end.value };
    return {
      kind: 'substr',
      src: src.info,
      start: startSym,
      length: { kind: 'binary', op: '-', left: endSym, right: startSym },
    };
  }

  protected concatenateInfo(
    left: Valued<Sym>,
    _leftLength: number,
    right: Valued<Sym>,
    _rightLength: number,
  ): Sym | undefined {
    const l = this.symOf(left);
    const r = this.symOf(right);
    if (l.kind === 'const' && r.kind === 'const') return undefined;
    return { kind: 'concat', left: l, right: r };
  }

  protected trimInfo(
    src: Valued<Sym>,
    leading: boolean,
    trailing: boolean,
  ): Sym | undefined {
    const s = this.symOf(src);
    if (s.kind === 'const' || sortOf(s) !== 'String') return undefined;
    return { kind: 'trim', src: s, leading, trailing };
  }

  private static readonly EQUALITY_OPS = new Set(['===', '==', '!==', '!=']);
  protected binaryInfo(
    op: string,
    l: Valued<Sym>,
    r: Valued<Sym>,
  ): Sym | undefined {
    const left = this.symOf(l);
    let right = this.symOf(r);
    if (ConcolicAnalysis.EQUALITY_OPS.has(op) && typeof l.value === 'string')
      right = this.toStringSym(r);
    if (left.kind === 'const' && right.kind === 'const') return undefined;
    if (ConcolicAnalysis.EQUALITY_OPS.has(op)) {
      const ls = sortOf(left);
      const rs = sortOf(right);
      if (ls !== undefined && rs !== undefined && !sortsComparable(ls, rs))
        return undefined;
    }
    return { kind: 'binary', op, left, right };
  }

  private toStringSym(v: Valued<Sym>): Sym {
    if (typeof v.value === 'string') return this.symOf(v);
    return { kind: 'const', value: String(v.value) };
  }

  protected unaryInfo(op: string, x: Valued<Sym>): Sym | undefined {
    const operand = this.symOf(x);
    if (operand.kind === 'const') return undefined;
    return { kind: 'unary', op, operand };
  }

  protected lengthOfStringInfo(s: Valued<Sym>): Sym | undefined {
    const src = this.symOf(s);
    if (src.kind === 'const') return undefined;
    return { kind: 'strlen', src };
  }

  protected containsStrInfo(s: Valued<Sym>, sub: Valued<Sym>): Sym | undefined {
    const str = this.symOf(s);
    const needle = this.symOf(sub);
    if (str.kind === 'const' && needle.kind === 'const') return undefined;
    if (sortOf(str) !== 'String' || sortOf(needle) !== 'String')
      return undefined;
    return { kind: 'contains', str, sub: needle };
  }

  protected stringIndexOfInfo(
    src: Valued<Sym>,
    searchValue: Valued<Sym>,
    fromIndex: Valued<Sym, number>,
  ): Sym | undefined {
    const s = this.symOf(src);
    const sub = this.symOf(searchValue);
    if (s.kind === 'const' && sub.kind === 'const') return undefined;
    if (sortOf(s) !== 'String' || sortOf(sub) !== 'String') return undefined;
    return { kind: 'strIndexOf', src: s, sub, from: this.symOf(fromIndex) };
  }

  protected getFieldInfo(
    base: Valued<Sym>,
    prop: Valued<Sym>,
    result: Valued<Sym>,
  ): Sym | undefined {
    const container = base.value;
    if (container === null || typeof container !== 'object') return undefined;

    const obj = this.objectMeta.get(container);
    if (obj !== undefined) {
      const key = String(prop.value);
      let sym = obj.fields.get(key);
      if (sym === undefined) {
        sym = {
          kind: 'var',
          name: `${obj.name}_${key}_${obj.counter++}`,
          sort: this.scalarSort(result.value),
        };
        obj.fields.set(key, sym);
      }
      return sym;
    }

    const meta = this.arrayMeta.get(container);
    const arr = base.info;
    if (meta !== undefined && arr !== undefined) {
      if (prop.value === 'length') return meta.lenSym;
      const index = this.arrayIndex(prop);
      if (index !== undefined) {
        this.pushConstraint(
          {
            kind: 'binary',
            op: '&&',
            left: {
              kind: 'binary',
              op: '>=',
              left: index,
              right: { kind: 'const', value: 0 },
            },
            right: {
              kind: 'binary',
              op: '<',
              left: index,
              right: meta.lenSym,
            },
          },
          true,
        );
        return {
          kind: 'select',
          arr,
          index,
          elemSort: seqElementSort(meta.elemSort) ?? 'Int',
        };
      }
    }
    return undefined;
  }

  // Symmetric to getFieldInfo: a `$.set` write updates the analysis's model of the
  // receiver. For a symbolic array, a "length" write rebinds its length var (so a
  // later `.length` read reflects e.g. push's len+argCount, instead of the stale
  // seed length); for a symbolic object, the field's var is rebound. Element-index
  // writes are left to the read-side `select` (unchanged). Side-effecting -> void.
  protected setFieldInfo(
    base: Valued<Sym>,
    prop: Valued<Sym>,
    value: Valued<Sym>,
  ): void {
    const container = base.value;
    if (container === null || typeof container !== 'object') return;

    const obj = this.objectMeta.get(container);
    if (obj !== undefined) {
      obj.fields.set(String(prop.value), this.symOf(value));
      return;
    }

    const meta = this.arrayMeta.get(container);
    if (meta !== undefined && prop.value === 'length')
      meta.lenSym = this.symOf(value);
  }

  protected opaqueCallInfo(
    f: unknown,
    entries: unknown[],
    _result: unknown,
  ): Sym | undefined {
    const base = entries[0];
    if (base === null || typeof base !== 'object') return undefined;
    const meta = this.arrayMeta.get(base);
    if (meta === undefined) return undefined;
    const arr = this.getInfo(base);
    if (arr === undefined) return undefined;

    return undefined;
  }

  private mintRegexVar(): Sym {
    return {
      kind: 'var',
      name: `re$${this.regexVarCounter++}`,
      sort: 'String',
    };
  }

  protected truncateInfo(x: Valued<Sym>): Sym | undefined {
    const src = this.symOf(x);
    if (src.kind === 'const') return undefined;
    return { kind: 'truncate', src };
  }

  protected clampInfo(
    x: Valued<Sym>,
    lower: Valued<Sym>,
    upper: Valued<Sym>,
  ): Sym | undefined {
    const xs = this.symOf(x);
    const lo = this.symOf(lower);
    const hi = this.symOf(upper);
    if (xs.kind === 'const' && lo.kind === 'const' && hi.kind === 'const')
      return undefined;
    // clamp(±∞, lo, hi) is exactly hi or lo — the spec uses +∞ for an absent
    // lastIndexOf position. minMax folds the non-finite away so the bound has an
    // SMT image (a raw ±∞ const throws UnsupportedSym in smt.ts).
    return this.minMax('max', lo, this.minMax('min', xs, hi));
  }

  // min/max with the ∞-absorbing operand folded out: min(+∞,x)=x, max(-∞,x)=x; the
  // other direction (min(-∞,_)=-∞, max(+∞,_)=+∞) keeps the ∞ since that IS the value,
  // but the clamp/range bounds we build never hit it (lo/hi are finite or symbolic).
  private minMax(op: 'min' | 'max', a: Sym, b: Sym): Sym {
    const nonFinite = (s: Sym): number | undefined =>
      s.kind === 'const' &&
      typeof s.value === 'number' &&
      !Number.isFinite(s.value)
        ? s.value
        : undefined;
    const av = nonFinite(a);
    if (av !== undefined)
      return (op === 'min') === (av === Infinity) ? b : a;
    const bv = nonFinite(b);
    if (bv !== undefined)
      return (op === 'min') === (bv === Infinity) ? a : b;
    return { kind: 'binary', op, left: a, right: b };
  }

  protected rangeInfo(
    indices: number[],
    lo: Valued<Sym, number>,
    loInclusive: boolean,
    hi: Valued<Sym, number>,
    hiInclusive: boolean,
    _ascending: boolean,
    _bid: number,
  ): (Sym | undefined)[] {
    // Record the loop-bound guards so the trip count is a flippable symbolic fact,
    // not a concrete artifact of the seed's length. The spec scans (StringIndexOf,
    // StringLastIndexOf, ...) loop `i` over `lo..hi` where the symbolic length lives
    // in `hi`; without a recorded guard the loop count is fixed by the seed, so the
    // search can never reach a position past the seed's length and length-changing
    // flips diverge on replay.
    const start = lo.value + (loInclusive ? 0 : 1);
    this.recordRangeGuards(indices, start, hi, hiInclusive);
    const loSym = this.symOf(lo);
    if (loSym.kind === 'const') return indices.map(() => undefined); // concrete lo -> concrete index
    return indices.map((index) =>
      index === lo.value
        ? loSym
        : {
            kind: 'binary',
            op: '+',
            left: loSym,
            right: { kind: 'const', value: index - lo.value },
          },
    );
  }

  private recordRangeGuards(
    indices: number[],
    start: number,
    hi: Valued<Sym, number>,
    hiInclusive: boolean,
  ): void {
    const hiSym = this.symOf(hi);
    if (hiSym.kind === 'const') return;
    const op = hiInclusive ? '<=' : '<';
    const guard = (i: number): Sym => ({
      kind: 'binary',
      op,
      left: { kind: 'const', value: i },
      right: hiSym,
    });
    if (indices.length) {
      const last = indices[indices.length - 1];
      this.pushConstraint(guard(last), true); 
      this.pushBranch(guard(last + 1), false);
    } else {
      this.pushBranch(guard(start), false);
    }
  }

  protected minInfo(operands: Valued<Sym, number>[]): Sym | undefined {
    return this.extremum('min', operands);
  }

  protected maxInfo(operands: Valued<Sym, number>[]): Sym | undefined {
    return this.extremum('max', operands);
  }

  // min/max fold to nested `(ite (<= a b) a b)` binaries (smt.ts SMT_BINARY). All
  // bounds concrete -> undefined (concretize); the spec's `from`/`to` window
  // computations stay symbolic so an open-ended substring carries its length.
  private extremum(
    op: 'min' | 'max',
    operands: Valued<Sym, number>[],
  ): Sym | undefined {
    const syms = operands.map((o) => this.symOf(o));
    if (syms.every((s) => s.kind === 'const')) return undefined;
    return syms.reduce((left, right) => this.minMax(op, left, right));
  }

  protected conditionInfo(id: number, cond: Valued<Sym>, taken: boolean): void {
    this.cov?.decision(id, taken);
    const sym = this.symOf(cond);
    if (sym.kind === 'const') return;
    if (this.isSpecSentinelReMap(id, sym)) return;
    const bool = this.toBool(sym);
    if (bool !== undefined)
      this.pathConstraints.push({ id, constraint: bool, taken });
  }

  // Spec-model branch ids are `Number.MAX_SAFE_INTEGER - N` (esmeta); user-code
  // branch ids are minted from 0 by ±1, so they never reach this floor.
  private static readonly SPEC_BRANCH_FLOOR = Number.MAX_SAFE_INTEGER - 1_000_000;

  // A spec model repackaging a pure matcher's not-found sentinel — StringIndexOf's
  // intrinsic does `if (result === -1) return -1` — is a modeling artifact, not
  // program control flow. Recording it would pin the concrete-found path with
  // `strIndexOf != -1`, making an `indexOf(...) === -1` query unsat under it.
  // indexOf is surfaced as the pure z3 `str.indexof` term (see $.stringIndexOf),
  // so drop such a spec-internal (high-id) `(matcher op -1)` discrimination; user
  // branches (small ids) and every non-matcher condition still constrain.
  // (Note: the concrete branch still runs, so a *concrete-not-found* seed whose
  // intrinsic arm returns a fresh -1 still loses the symbolic result — that arm,
  // not the recorded constraint, is the limit.)
  private isSpecSentinelReMap(id: number, sym: Sym): boolean {
    if (id < ConcolicAnalysis.SPEC_BRANCH_FLOOR) return false;
    if (sym.kind !== 'binary' || !ConcolicAnalysis.EQUALITY_OPS.has(sym.op))
      return false;
    const isMatcher = (s: Sym) => s.kind === 'strIndexOf';
    const isNotFound = (s: Sym) => s.kind === 'const' && s.value === -1;
    return (
      (isMatcher(sym.left) && isNotFound(sym.right)) ||
      (isMatcher(sym.right) && isNotFound(sym.left))
    );
  }

  // Statement-coverage observers. FlowAnalysis sets currentId for only the seven
  // op kinds it models (binary/unary/literal/get·putField/condition/call), so on
  // their own those miss whole lines — bare `return x`, `var x = y`, a function's
  // signature line. These are the core hooks flow leaves unimplemented, so adding
  // them here is purely additive: core dispatches, flow skipped them, and a void
  // return is a no-op (read/write/_return/_throw treat undefined as "unchanged").
  // Every executed line carries at least one of these or a flow op, so collapsed
  // to lines the union is complete statement coverage. Cost is one guarded touch
  // per op, and only in coverage mode (this.cov set); the microbench pays nothing.
  read(id: number): void {
    this.cov?.touch(id);
  }
  write(id: number): void {
    this.cov?.touch(id);
  }
  declare(id: number): void {
    this.cov?.touch(id);
  }
  _return(id: number): void {
    this.cov?.touch(id);
  }
  _throw(id: number): void {
    this.cov?.touch(id);
  }
  functionEnter(id: number): void {
    this.cov?.touch(id);
  }
  scriptEnter(id: number): void {
    this.cov?.touch(id);
  }

  private toBool(sym: Sym): Sym | undefined {
    const sort = sortOf(sym);
    if (sort === 'Bool') return sym;
    if (sort === 'String')
      return {
        kind: 'binary',
        op: '!==',
        left: sym,
        right: { kind: 'const', value: '' },
      };
    if (isNumericSort(sort))
      return {
        kind: 'binary',
        op: '!==',
        left: sym,
        right: { kind: 'const', value: 0 },
      };
    return undefined;
  }

  private symOf(v: Valued<Sym>): Sym {
    return v.info ?? { kind: 'const', value: v.value };
  }

  private pushConstraint(constraint: Sym, binder = false): void {
    this.pathConstraints.push({ id: -1, constraint, taken: true, binder });
  }

  private syntheticBranchId = -1000;
  private pushBranch(constraint: Sym, taken: boolean): void {
    this.pathConstraints.push({
      id: this.syntheticBranchId--,
      constraint,
      taken,
    });
  }

  private scalarSort(v: unknown): Sort {
    if (typeof v === 'string') return 'String';
    if (typeof v === 'boolean') return 'Bool';
    if (typeof v === 'number') return 'Real';
    return 'Int';
  }
  private seqSortOf(elem: unknown): Sort {
    switch (this.scalarSort(elem)) {
      case 'String':
        return 'StringSeq';
      case 'Bool':
        return 'BoolSeq';
      default:
        return 'IntSeq';
    }
  }

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

  // --- prelude entry points ------------------------------------------------
  private nameCounts = new Map<string, number>();
  private rename(name: string): string {
    const n = (this.nameCounts.get(name) ?? 0) + 1;
    this.nameCounts.set(name, n);
    return n === 1 ? name : `${name}_${n}`;
  }

  symbolNamed(name: unknown, seed: unknown): unknown /* Lifted */ {
    return this.makeSymbolic(
      this.rename(String(this.valued(name).value)),
      seed,
    );
  }

  private static readonly PURE_TYPES = [
    'string',
    'number',
    'boolean',
    'object',
    'array_number',
    'array_string',
    'array_bool',
    'null',
  ] as const;
  private pureSeed(type: string): unknown {
    switch (type) {
      case 'string':
        return 'seed_string';
      case 'number':
        return 0;
      case 'boolean':
        return false;
      case 'object':
        return {};
      case 'array_number':
        return [0];
      case 'array_string':
        return [''];
      case 'array_bool':
        return [false];
      default:
        return null; // 'null'
    }
  }

  pureSymbolNamed(name: unknown): unknown /* Lifted */ {
    const varName = this.rename(String(this.valued(name).value));
    const typeVar: Sym = { kind: 'var', name: `${varName}_t`, sort: 'String' };
    const input = this.seedInput();
    const typeKey = `${varName}_t`;
    const typeConcrete =
      typeKey in input ? String(input[typeKey]) : 'undefined';
    for (const type of ConcolicAnalysis.PURE_TYPES) {
      const taken = typeConcrete === type;
      this.pushBranch(
        {
          kind: 'binary',
          op: '==',
          left: typeVar,
          right: { kind: 'const', value: type },
        },
        taken,
      );
      if (taken) {
        const seed = this.pureSeed(type);
        return seed === null ? null : this.makeSymbolic(varName, seed);
      }
    }
    return undefined; // ExpoSE's `else`: an unconstrained type yields undefined
  }

  makeSymbolic(name: unknown, seed: unknown): unknown /* Lifted */ {
    const varName = String(this.valued(name).value);
    const input = this.seedInput();
    const concrete =
      varName in input ? input[varName] : this.valued(seed).value;

    if (Array.isArray(concrete)) {
      // Array elements are still individually lifted (only the array itself was
      // unlifted), so project the first through `valued` to read its type.
      const sort = this.seqSortOf(
        concrete.length ? this.valued(concrete[0]).value : undefined,
      );
      const arrSym: Sym = { kind: 'var', name: varName, sort };
      const lenSym: Sym = { kind: 'var', name: `${varName}_len`, sort: 'Int' };
      this.arrayMeta.set(concrete, { elemSort: sort, lenSym });
      this.arrayVars.set(varName, sort);
      this.pushConstraint(
        {
          kind: 'binary',
          op: '>=',
          left: lenSym,
          right: { kind: 'const', value: 0 },
        },
        true,
      );
      return this.lift(concrete, arrSym);
    }
    if (concrete !== null && typeof concrete === 'object') {
      this.objectMeta.set(concrete, {
        name: varName,
        counter: 0,
        fields: new Map(),
      });
      return this.lift(concrete);
    }
    return this.lift(concrete, {
      kind: 'var',
      name: varName,
      sort: this.scalarSort(concrete),
    });
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
      emit(cond.value ? 'detected' : 'clean');
      return;
    }
    let verdict: 'valid' | 'invalid' | 'unknown';
    try {
      verdict = solveValidity(this.pathConstraints, sym);
    } catch (e) {
      console.error(`[concolic] assert unsolved: ${(e as Error).message}`);
      emit('error');
      return;
    }
    console.error(
      `[concolic] assert ${symToString(sym)} under ${this.pathConstraints.length} ` +
        `constraint(s) -> ${verdict}`,
    );
    emit(verdict === 'valid' ? 'detected' : 'clean');
  }

  isSat(condArg: unknown, expectedArg: unknown): void {
    const expected = this.valued(expectedArg).value ? 'sat' : 'unsat';
    const emit = (actual: 'sat' | 'unsat' | 'error') =>
      console.log(`@@DJX_VERDICT ${actual} ${expected}`);

    const cond = this.valued(condArg);
    const sym = this.symOf(cond);
    if (sym.kind === 'const') {
      emit(cond.value ? 'sat' : 'unsat');
      return;
    }
    let verdict: 'sat' | 'unsat' | 'unknown';
    try {
      verdict = solveSat(this.pathConstraints, sym);
    } catch (e) {
      console.error(`[concolic] IS_SAT unsolved: ${(e as Error).message}`);
      emit('error'); // unsolved is its own verdict; classifies as FN/FP by expected
      return;
    }
    console.error(
      `[concolic] IS_SAT ${symToString(sym)} under ${this.pathConstraints.length} ` +
        `constraint(s) -> ${verdict}`,
    );
    emit(verdict === 'sat' ? 'sat' : 'unsat'); // unknown -> unsat (no witness found)
  }

  // An uncaught throw escaping the program (ExpoSE SymbolicExecution._uncaughtException).
  // Corpus findings ARE these throws (`throw "Reachable"`), and the corpus oracle
  // counts them, so we record one per escaping exception. `assume(false)` throws
  // the bridge's NotAnErrorException to prune a path — that is not a program error,
  // so we drop it. The thrown value is Lifted (instrumented code), hence unlift.
  recordUncaught(e: unknown): void {
    const v: unknown = this.valued(e).value;
    const NotAnError = (globalThis as Record<string, unknown>).__NotAnError__;
    if (typeof NotAnError === 'function' && v instanceof NotAnError) return;
    this.errors.push({
      error: String(v),
      stack: v instanceof Error ? v.stack : undefined,
    });
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
  // map (this.cov; see coverage.ts). `alternatives` are the negated-branch child
  // inputs the Distributor re-queues to drive multi-path search (M2). Without the
  // env vars (e.g. the microbench) this is a no-op; the @@DJX_VERDICT path is
  // untouched.
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
        errors: this.errors,
        alternatives: this.alternatives(),
        stats: JSON.stringify({}),
      }),
    );
    const covPath = process.env.EXPOSE_COVERAGE_PATH;
    if (covPath)
      writeFileSync(
        covPath,
        JSON.stringify(this.cov ? this.cov.toPayload(D$.ids, D$.files) : {}),
      );
  }

  // Readable path-condition rendering (ExpoSE _stringPC analogue; only the `pc`
  // display field, not parsed by the Distributor).
  private pcToString(
    cs: readonly { constraint: Sym; taken: boolean }[],
  ): string {
    return cs
      .map((p) => `${p.taken ? '' : '¬'}${symToString(p.constraint)}`)
      .join(', ');
  }

  // Child inputs for the unexplored side of each branch (ExpoSE
  // SymbolicState.alternatives/_buildPC). From `_bound` onward, negate branch i
  // while holding branches [0..i-1] at their taken polarity, solve for a model,
  // and emit it as a child input tagged `_bound = i+1` (a re-run then fixes the
  // prefix and explores past i). The Distributor re-queues these
  // (Center._expandAlternatives) — that is how multi-path search proceeds. A
  // branch we can't translate or that is infeasible is skipped, not fatal.
  private alternatives(): {
    input: Record<string, unknown>;
    pc: string;
    forkIid: number;
  }[] {
    const bound =
      typeof this.seedInput()._bound === 'number'
        ? (this.seedInput()._bound as number)
        : 0;
    const pcs = this.pathConstraints;
    // Replay divergence (ExpoSE SymbolicState.js:299): the seed pinned `_bound`
    // branches, but this run reached fewer — the child input failed to steer
    // execution onto the intended path (a modeling gap, e.g. an op we don't
    // translate so a branch went concrete). ExpoSE throws here and writes no
    // result; we mirror that — writeExpoSEResult evaluates us before the file
    // write, so divergence leaves no out file and the Distributor sees a failed
    // path rather than a silently-wrong one.
    if (bound > pcs.length) {
      throw `Bound ${bound} > ${pcs.length}, divergence has occured`;
    }
    const out: {
      input: Record<string, unknown>;
      pc: string;
      forkIid: number;
    }[] = [];
    for (let i = bound; i < pcs.length; i++) {
      if (pcs[i].binder) continue; // engine-introduced (bounds/length>=0): never flipped
      const branches = [
        ...pcs.slice(0, i),
        { constraint: pcs[i].constraint, taken: !pcs[i].taken },
      ];
      let model;
      try {
        model = solveModel(branches);
      } catch {
        continue; // unsupported op in this branch -> can't flip
      }
      if (!model) continue; // negated branch infeasible under the prefix
      const input: Record<string, unknown> = Object.fromEntries(model);
      input._bound = i + 1;
      this.materializeArrayInputs(input);
      out.push({ input, pc: this.pcToString(branches), forkIid: pcs[i].id });
    }
    return out;
  }

  private materializeArrayInputs(input: Record<string, unknown>): void {
    for (const [name, sort] of this.arrayVars) {
      if (name in input) continue; // element-constrained: already a concrete array
      const lenKey = `${name}_len`;
      if (!(lenKey in input)) continue; // length not constrained either
      const raw = Number(input[lenKey]);
      const len = Math.max(
        0,
        Math.min(Number.isFinite(raw) ? raw : 0, ARRAY_READBACK_BOUND),
      );
      input[name] = Array.from({ length: len }, () =>
        this.defaultArrayElem(sort),
      );
    }
  }

  private defaultArrayElem(seqSort: Sort): unknown {
    switch (seqSort) {
      case 'StringSeq':
        return '';
      case 'BoolSeq':
        return false;
      default:
        return 0; // IntSeq / numeric element
    }
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
      if (parsed && typeof parsed === 'object')
        seed = parsed as Record<string, unknown>;
    } catch {
      /* not JSON -> fresh seed */
    }
    return (this._seed = seed);
  }
}

const analysis = new ConcolicAnalysis();
D$.analysis = analysis;

// ExpoSE drop-in only: route uncaught program throws into errors[] (the corpus
// oracle counts them; see recordUncaught). Mirrors ExpoSE's process-level
// handler. Gated on EXPOSE_OUT_PATH so the microbench keeps Node's default
// crash-on-throw behaviour.
if (process.env.EXPOSE_OUT_PATH) {
  process.on('uncaughtException', (e) => analysis.recordUncaught(e));
}