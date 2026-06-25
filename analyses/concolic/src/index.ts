import { writeFileSync } from 'node:fs';
import {
  FlowAnalysis,
  type Valued,
  type InfoDomain,
} from '../../flow/index.js';
import {
  type Sym,
  type Sort,
  seqElementSort,
  sortOf,
  sortsComparable,
  isNumericSort,
  symToString,
} from '@shared/sym.js';
import { encodeRegex, type EncodedRegex } from '@shared/regex.js';
import { solveValidity, solveModel, solveSat } from './smt.js';
import { installPrelude } from './prelude.js';

declare const D$: { analysis: ConcolicAnalysis } & Record<string, any>;

const GHOSTS = installPrelude();

type PathConstraint = {
  id: number;
  constraint: Sym;
  taken: boolean;
  binder?: boolean;
};
type ArrayMeta = { elemSort: Sort };
type ObjectMeta = { name: string; counter: number; fields: Map<string, Sym> };

export class ConcolicAnalysis extends FlowAnalysis<Sym | undefined> {
  result: unknown;
  private pathConstraints: PathConstraint[] = [];
  private errors: { error: string; stack?: string }[] = [];

  private arrayMeta = new WeakMap<object, ArrayMeta>();
  private objectMeta = new WeakMap<object, ObjectMeta>();
  private regexVarCounter = 0;

  protected transparentCalls = GHOSTS;

  domain: InfoDomain<Sym | undefined> = {
    getBottom: () => undefined,
    isBottom: (info): info is undefined => info === undefined,
  };

  // An unmodeled op (no specific Info hook, or one whose core operation has no z3
  // image — e.g. $.floor/$.round bottom out here): CONCRETIZE. Return bottom so
  // the result becomes a const of its concrete value, exactly as ExpoSE's
  // `_symbolicBinary` default. ONE behavior across every harness — the single-path
  // microbench and the multi-path Distributor drop-in alike — so the microbench
  // measures the SAME concolic we deploy as ExpoSE's Analyser (a fair, like-for-like
  // comparison; the framework's novelty must show through the MODELED ops, not a
  // mode-specific trick). A stale concretization can mislead a branch, but in the
  // Distributor concrete re-execution + the divergence guard self-correct it, and
  // in the single-path microbench it is the same imprecision ExpoSE itself has.
  protected baseInfo(
    _value: unknown,
    _parents: Valued<Sym>[],
  ): Sym | undefined {
    return undefined;
  }

  protected substringInfo(
    src: Valued<Sym>,
    start: Valued<Sym, number>,
    _end: Valued<Sym, number>,
    resultLength: number,
  ): Sym | undefined {
    if (src.info === undefined) return undefined;
    return {
      kind: 'substr',
      src: src.info,
      start: start.value,
      length: resultLength,
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

  // String.prototype.toLowerCase, modeled as in ExpoSE's StringModels.js: case
  // conversion has no z3 string operator, so we do NOT encode the mapping.
  // Instead we restrict the path to subjects already free of uppercase
  // (`str ∈ /^[^A-Z]+$/`), where the fold is the identity, and return the
  // subject's own Sym. toUpperCase is the symmetric extension (ExpoSE models only
  // toLowerCase). The constraint enters as a binder (never flipped); on a
  // mixed-case subject it is concretely violated, exactly as in ExpoSE — the
  // concrete re-execution of any alternative input self-corrects.
  protected toLowerInfo(s: Valued<Sym>): Sym | undefined {
    return this.caseFoldIdentity(s, '^[^A-Z]+$');
  }

  protected toUpperInfo(s: Valued<Sym>): Sym | undefined {
    return this.caseFoldIdentity(s, '^[^a-z]+$');
  }

  private caseFoldIdentity(
    s: Valued<Sym>,
    singleCasePattern: string,
  ): Sym | undefined {
    const src = this.symOf(s);
    if (src.kind === 'const') return undefined;
    let enc: EncodedRegex;
    try {
      enc = encodeRegex(singleCasePattern, () => this.mintRegexVar());
    } catch (e) {
      console.error(`[concolic] case-fold regex unmodeled: ${String(e)}`);
      return undefined; // -> baseInfo concretizes (bottom -> const); the verdict falls back to concrete
    }
    for (const a of enc.assertions) this.pushConstraint(a, true);
    this.pushConstraint({ kind: 'inRe', str: src, re: enc.ast }, true);
    return src;
  }

  private static readonly EQUALITY_OPS = new Set(['===', '==', '!==', '!=']);
  protected binaryInfo(
    op: string,
    l: Valued<Sym>,
    r: Valued<Sym>,
  ): Sym | undefined {
    const left = this.symOf(l);
    let right = this.symOf(r);
    // ExpoSE SymbolicState.binary: a string LEFT operand coerces the right via
    // ToString before the (bare) equality. A string right keeps its symbolic
    // form; a non-string right is concretized to its `String(value)` image — what
    // a JS `string == other` comparison coerces through. This turns the otherwise
    // ill-typed cross-sort `"x" == 5` into the solvable string eq `x == "5"`. We
    // apply it only at equality ops: the relational/arith string-left cases ExpoSE
    // also coerces would need string ordering, outside our z3 string theory.
    if (ConcolicAnalysis.EQUALITY_OPS.has(op) && typeof l.value === 'string')
      right = this.toStringSym(r);
    if (left.kind === 'const' && right.kind === 'const') return undefined;
    // Cross-sort equality is concretely decided (a value is one definite sort per
    // path): e.g. a numeric StringIndexOf result vs the "not-found" string sentinel
    // — discriminating a union arm. It carries no symbolic info and would emit
    // ill-typed SMT (`(= Int String)` -> z3 unknown), so leave it concrete. Int/Real
    // stay symbolic, though — both are numbers, bridged by a coercion in smt.ts.
    if (ConcolicAnalysis.EQUALITY_OPS.has(op)) {
      const ls = sortOf(left);
      const rs = sortOf(right);
      if (ls !== undefined && rs !== undefined && !sortsComparable(ls, rs))
        return undefined;
    }
    return { kind: 'binary', op, left, right };
  }

  // ExpoSE SymbolicState.ToString: a string operand keeps its symbolic form; any
  // other value concretizes to `String(value)` (its `"" + value` image, the
  // coercion JS `==` applies to the non-string side of a string comparison).
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
      if (prop.value === 'length') return { kind: 'arrlen', arr };
      const index = this.arrayIndex(prop);
      if (index !== undefined) {
        const length: Sym = { kind: 'arrlen', arr };
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
            right: { kind: 'binary', op: '<', left: index, right: length },
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

    if (f === Array.prototype.push) {
      const arg = this.valued(entries[1]);
      // A type-mismatched push wipes the symbolic array (ExpoSE bug28): from here
      // on the array is concrete, so drop both its sequence Info and its meta.
      if (typeof arg.value !== this.elemTypeof(meta.elemSort)) {
        this.setInfo(base, undefined);
        this.arrayMeta.delete(base);
        return undefined;
      }
      const grown: Sym = {
        kind: 'seqConcat',
        left: arr,
        right: { kind: 'seqUnit', elem: this.symOf(arg) },
      };
      this.setInfo(base, grown);
      return { kind: 'arrlen', arr: grown }; // push returns the new length
    }

    if (f === Array.prototype.pop) {
      const lastIndex: Sym = {
        kind: 'binary',
        op: '-',
        left: { kind: 'arrlen', arr },
        right: { kind: 'const', value: 1 },
      };
      this.setInfo(base, {
        kind: 'seqExtract',
        src: arr,
        offset: { kind: 'const', value: 0 },
        length: lastIndex,
      });
      return {
        kind: 'select',
        arr,
        index: lastIndex,
        elemSort: seqElementSort(meta.elemSort) ?? 'Int',
      }; // the removed last element
    }

    if (f === Array.prototype.indexOf) {
      const sub: Sym = {
        kind: 'seqUnit',
        elem: this.symOf(this.valued(entries[1])),
      };
      return {
        kind: 'seqIndexOf',
        arr,
        sub,
        from: { kind: 'const', value: 0 },
      };
    }

    if (f === Array.prototype.includes) {
      const sub: Sym = {
        kind: 'seqUnit',
        elem: this.symOf(this.valued(entries[1])),
      };
      return { kind: 'seqContains', arr, sub };
    }

    if (f === Array.prototype.join)
      return this.joinSym(base, arr, entries[1], meta);

    return undefined;
  }

  // The symbolic projection of a regex match (`$.regexExec`), ported from
  // ExpoSE RegexModels onto the Sym IR. `matched` is `str.in_re` over the
  // encoded pattern; `index` the match start; `captures[i]` the i-th group as a
  // fresh String var (capture[0] = whole match), pinned by EnableCaptures. The
  // spec models build test/exec/search/match from these; the `in_re` BRANCH is
  // recorded wherever a model (or user code) branches on `matched`, so we only
  // push the capture binders here.
  protected regexExecInfo(
    regex: Valued<Sym>,
    string: Valued<Sym, string>,
    _result: unknown,
  ): { matched: Sym; index: Sym; captures: Sym[] } | undefined {
    const strSym = this.symOf(string);
    const re = regex.value;
    // ExpoSE shouldBeSymbolic: only model a symbolic string against a real RegExp.
    if (strSym.kind === 'const' || !(re instanceof RegExp)) return undefined;

    let enc: EncodedRegex;
    try {
      enc = encodeRegex(re.source, () => this.mintRegexVar());
    } catch (e) {
      console.error(`[concolic] regex unmodeled: ${String(e)}`);
      return undefined; // -> baseInfo concretizes (bottom -> const); the verdict falls back to concrete
    }

    this.enableCaptures(enc, strSym);
    return {
      matched: { kind: 'inRe', str: strSym, re: enc.ast },
      index: enc.startIndex,
      captures: enc.captures,
    };
  }

  // ExpoSE EnableCaptures: the capture vars are pinned by the regex's own
  // assertions, and equal the regex's `implier` (anchors ++ captures) whenever
  // the string matches. Both enter as binder constraints (never flipped).
  private enableCaptures(enc: EncodedRegex, strSym: Sym): void {
    for (const a of enc.assertions) this.pushConstraint(a, true);
    this.pushConstraint(
      {
        kind: 'binary',
        op: '=>',
        left: { kind: 'inRe', str: strSym, re: enc.ast },
        right: { kind: 'binary', op: '===', left: strSym, right: enc.implier },
      },
      true,
    );
  }

  // A fresh String var for the regex encoder's fillers/anchors/captures. The
  // counter is per-run (the analysis is reconstructed each process), so replay
  // re-issues the same names. The `re$` prefix avoids user symbol-name clashes.
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

  // clamp(x, lo, hi) = max(lo, min(x, hi)). Modeled symbolically (not via baseInfo)
  // so a clamp over a symbolic bound — e.g. a search loop's start index clamped to
  // a symbolic length — stays a real Sym instead of a concretized const that would
  // drop the loop-bound constraint. min/max render to ite in smt.ts.
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
    return {
      kind: 'binary',
      op: 'max',
      left: lo,
      right: { kind: 'binary', op: 'min', left: xs, right: hi },
    };
  }

  // A branch (user-code `if`/`&&`/… via D$.C, or a model-internal bound check via
  // $.condition) was taken. If its condition is symbolic, record it as a path
  // constraint; the concrete `taken` direction fixes its polarity. Both branch
  // sources funnel here through FlowAnalysis.condition.
  protected conditionInfo(id: number, cond: Valued<Sym>, taken: boolean): void {
    const sym = this.symOf(cond);
    // A constant branch carries no constraint — including a condition whose value
    // came (concretized) through an unmodeled op (baseInfo -> bottom -> const);
    // it already ran concretely. Matches ExpoSE.
    if (sym.kind === 'const') return;
    const bool = this.toBool(sym);
    if (bool !== undefined)
      this.pathConstraints.push({ id, constraint: bool, taken });
  }

  // ToBoolean at a branch site (ExpoSE SymbolicState.toBool): a branch condition
  // must be a Bool, but `if (x)` hands us `x` itself before coercion (the core
  // passes the raw value to `condition`, no ToBoolean lift). A comparison/logical
  // sym is already Bool and passes through; a String coerces to `x !== ""`, a
  // number to `x !== 0`. Anything else (object/array/seq) has no z3 truthiness
  // image — ExpoSE concretizes it, so we drop the branch (undefined).
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

  // Record a real (flippable) branch the engine raises itself rather than
  // observes at a `$.condition` site — currently only the pureSymbol type
  // cascade. Each gets a distinct synthetic id so alternatives() exposes it as
  // its own fork point (the Distributor buckets by forkIid). The ids count down
  // from -1000 to avoid the binder sentinel (-1) and user/spec branch ids; they
  // affect only search-order bucketing, never replay (which keys off `_bound`).
  private syntheticBranchId = -1000;
  private pushBranch(constraint: Sym, taken: boolean): void {
    this.pathConstraints.push({
      id: this.syntheticBranchId--,
      constraint,
      taken,
    });
  }

  // The scalar SMT sort concolic models a concrete value with (its two scalar
  // sorts, plus Bool); the seq sort whose elements are that scalar; and the JS
  // `typeof` those elements have (for the push type-match check).
  private scalarSort(v: unknown): Sort {
    if (typeof v === 'string') return 'String';
    if (typeof v === 'boolean') return 'Bool';
    // A symbolic `number` variable is Real: its sort is fixed at declaration and
    // the program may use it in real division, even when seeded with an integer
    // (ExpoSE _getSort). Integer *constants* still stay Int — see sortOf.
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
  private elemTypeof(seqSort: Sort): string {
    switch (seqElementSort(seqSort)) {
      case 'String':
        return 'string';
      case 'Bool':
        return 'boolean';
      default:
        return 'number';
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
  private joinSym(
    base: object,
    arr: Sym,
    sepArg: unknown,
    meta: ArrayMeta,
  ): Sym | undefined {
    if (seqElementSort(meta.elemSort) !== 'String') return undefined;
    const n = (base as unknown[]).length;
    if (n === 0) return { kind: 'const', value: '' };
    const sepValue =
      sepArg === undefined ? undefined : this.valued(sepArg).value;
    const sep: Sym = {
      kind: 'const',
      value: sepValue === undefined ? ',' : String(sepValue),
    };
    const at = (i: number): Sym => ({
      kind: 'select',
      arr,
      index: { kind: 'const', value: i },
      elemSort: 'String',
    });
    let acc = at(0);
    for (let i = 1; i < n; i++) {
      acc = {
        kind: 'concat',
        left: { kind: 'concat', left: acc, right: sep },
        right: at(i),
      };
    }
    return acc;
  }

  // --- prelude entry points ------------------------------------------------

  // ExpoSE's AssertToolkit gives every symbol a process-unique name (first `X`
  // stays `X`, the next becomes `X_2`, …) so reused names are independent SMT
  // variables. We do the same per run, on the *raw* name — running this over a
  // Lifted string would coerce it to "[object Object]" at the Map key (see the
  // raw-vs-lifted seam). `makeSymbolic`/`__symbolic__` deliberately skip this:
  // the microbench already hands out distinct names and snapshots its SMT vars.
  private nameCounts = new Map<string, number>();
  private rename(name: string): string {
    const n = (this.nameCounts.get(name) ?? 0) + 1;
    this.nameCounts.set(name, n);
    return n === 1 ? name : `${name}_${n}`;
  }

  // `S$.symbol(name, seed)`: unique the name, then mint as usual. Deterministic
  // renaming keeps replay sound — a child run re-issues the same calls, so the
  // same renamed names line up with the child input's keys.
  symbolNamed(name: unknown, seed: unknown): unknown /* Lifted */ {
    return this.makeSymbolic(
      this.rename(String(this.valued(name).value)),
      seed,
    );
  }

  // The candidate types a pureSymbol forks across, in ExpoSE's createPureSymbol
  // order. `pureSeed` mints a FRESH concrete seed per arm (a shared object/array
  // literal would alias across two pureSymbols via arrayMeta/objectMeta).
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

  // `S$.pureSymbol(name)`: a typeless symbol with no seed, realized by type
  // forking exactly as ExpoSE's SymbolicState.createPureSymbol. A fresh String
  // *type* variable `name_t` (seeded "undefined") drives a cascade of symbolic
  // equality branches against the type-name strings. On the seed run every arm is
  // false, so the symbol is `undefined`; the recorded branches become
  // alternatives the Distributor re-queues with `name_t` pinned to one type, on
  // which the matching arm mints a typed symbol via makeSymbolic — no engine
  // machinery beyond the existing alternatives()/replay loop. The per-type seeds
  // match createSymbolicValue ("seed_string"/0/false/{}/[0]/[""]/[false]/null).
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

  // Introduce symbolic variable `name`, returning a lifted value the program
  // runs concretely on. Replay (M3): if the Distributor's seed input carries a
  // concrete for this variable (a child input from a negated branch), drive
  // execution with THAT value so we follow the intended path; otherwise keep the
  // program's own seed. `make` then mints a fresh value tagged with its symbolic
  // form, dispatched on the concrete's shape:
  //   - array  -> a `(Seq T)` variable (T from the seed's first element); reads
  //     of `.length`/elements become symbolic via getFieldInfo, and the array's
  //     length is constrained non-negative (ExpoSE).
  //   - object -> a symbolic object whose fields are minted lazily on read.
  //   - scalar -> a `var` whose sort follows the seed (String / Bool / else Int).
  // Array/object replay inputs don't round-trip the scalar SMT model parser, so
  // only the scalar case is re-seeded from a child input.
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
      this.arrayMeta.set(concrete, { elemSort: sort });
      this.pushConstraint(
        {
          kind: 'binary',
          op: '>=',
          left: { kind: 'arrlen', arr: arrSym },
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
      // No symbolic dependency (or a value concretized through an unmodeled op, now
      // a const): fall back to the concrete truth value, as ExpoSE does.
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

  // SAT-query assertion (`__IS_SAT__`): the dual of symbolicAssert. Instead of
  // asking whether `cond` is necessarily valid (`PC ∧ ¬cond` UNSAT), hand z3
  // `PC ∧ cond` and ask whether a witness exists. `expected` is the per-assert
  // ground truth (true = should be SAT). We print `@@DJX_VERDICT <actual>
  // <expected>` over the sat/unsat vocabulary so the runner classifies each
  // query independently (sat = positive/finding, unsat = negative).
  isSat(condArg: unknown, expectedArg: unknown): void {
    const expected = this.valued(expectedArg).value ? 'sat' : 'unsat';
    const emit = (actual: 'sat' | 'unsat' | 'error') =>
      console.log(`@@DJX_VERDICT ${actual} ${expected}`);

    const cond = this.valued(condArg);
    const sym = this.symOf(cond);
    if (sym.kind === 'const') {
      // No symbolic dependency (or a value concretized through an unmodeled op): a
      // constant query is satisfiable iff it is concretely true on this path; fall
      // back to that truth value, as ExpoSE does.
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
        errors: this.errors,
        alternatives: this.alternatives(),
        stats: JSON.stringify({}),
      }),
    );
    const covPath = process.env.EXPOSE_COVERAGE_PATH;
    if (covPath) writeFileSync(covPath, JSON.stringify({}));
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
