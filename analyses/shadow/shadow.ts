import { isInstrumentedFn, required } from './utils.js';
import type { Analysis } from '../../src/index.js';
import type {
  LiftedTransfer,
  Lifted,
  Unlifted,
  Primitive,
  Valued,
} from './type.js';
import Model from './internal/model.js';
import { isConstructable } from './internal/constructable.js';
import * as site from './internal/site.js';
import type * as escape from './internal/escape.js';
import { AO__CanonicalNumericIndexString, SYNTAX__add } from './spec/index.js';
import { concatList } from './utils.js';
import { LiftedTransferClass } from './transfer/lift.js';

const NON_VALUE_BINARY_OPS = new Set(['instanceof', 'in']);

type BinFrame = {
  ty: 'bin';
  op: string;
  left: Lifted;
  right: Lifted;
  escaped?: escape.EscapeRecord[]; // coercion-method shadows for native (non-`+`) ops
};
type UnFrame = {
  ty: 'un';
  op: string;
  operand: Lifted;
  escaped?: escape.EscapeRecord[]; // coercion-method shadows for native +/-/~
};
type GetFieldFrame = { ty: 'getField'; base: Lifted; prop: Lifted };

type CallFrame = OpaqueCall | TransparentCall;
type OpaqueCall = {
  ty: 'opaque';
  f: unknown;
  modeled: boolean;
  entries: unknown[];
  escaped: escape.EscapeRecord[];
};
type TransparentCall = { ty: 'transparent'; entries: unknown[] };

export abstract class ShadowExecution<Shadow>
  extends LiftedTransferClass<Shadow>
  implements Analysis
{
  protected site(): site.Site {
    return this.siteResolver.resolve();
  }

  protected transparentCalls: ReadonlySet<unknown> = new Set();

  override policy = {
    isOpaque: (f: unknown) =>
      typeof f === 'function' &&
      !isInstrumentedFn(f) &&
      !this.transparentCalls.has(f),
  };

  condition(id: number, _op: string, value: unknown): { result: unknown } {
    if (_op !== 'model') this.siteResolver.reportId(id);
    // is this correct...
    const cond = this.$.condition(
      id,
      value as Lifted<unknown> as Lifted<boolean>,
    );
    const raw = this.$.value(cond);
    return { result: raw };
  }

  classHeritage(_id: number, value: unknown): { result: unknown } {
    return { result: this.$.value(value as Lifted<unknown>) };
  }

  literal(_id: number, value: unknown) {
    this.siteResolver.reportId(_id);
    this.escaper.markEscapableLiteral(value);
    const w = this.$.default(value as Unlifted<unknown>, []);
    return w === value ? undefined : { result: w };
  }

  /* for-in/of iterates natively, currently string iteration losts info */
  forInOfObject(_id: number, value: unknown, _isForIn: boolean) {
    const raw = this.$.value(value as Lifted<unknown>);
    return raw === value ? undefined : { result: raw };
  }

  binaryPre(_id: number, op: string, left: Lifted, right: Lifted) {
    const l = this.$.value(left);
    const r = this.$.value(right);
    // `+` is authoritative (skip + SYNTAX__add, which ToPrimitives soundly).
    // Other ops run natively on the peeked raws, so an object operand would have
    // its instrumented valueOf/toString re-entered by native coercion — shadow
    // those with unlifting wrappers first, restored in `binary`.
    const escaped =
      op === '+' ? undefined : this.escaper.wrapForOperator([l, r]);
    const frame: BinFrame = { ty: 'bin', op, left, right, escaped };
    return { op, left: l, right: r, skip: op === '+', frame };
  }

  binary(
    _id: number,
    _op: string,
    _l: Lifted,
    _r: Lifted,
    result: Unlifted<unknown>,
    frame: unknown,
  ) {
    required(frame !== undefined, 'binary hook missing frame');
    // A binary op (including `+`/template via SYNTAX__add) attributes to the
    // user-code site, like NodeMedic stamps the source location on `binary`.
    this.siteResolver.reportId(_id);
    const f = frame as BinFrame;
    if (f.escaped) this.escaper.restore(f.escaped); // unwrap operand coercion shadows
    if (f.op === '+') {
      return {
        result: SYNTAX__add(this.$, f.left, f.right) as Lifted<unknown>,
      };
    } else {
      // assert : result is given
      // The hook's own l/r are the peeked raws binaryPre handed to native
      // execution — info lives only on the frame's lifted operands.
      const left = this.valued(f.left);
      const right = this.valued(f.right);
      const resultInfo = NON_VALUE_BINARY_OPS.has(f.op)
        ? this.defaultInfo(result, [left, right])
        : (this.binaryInfo?.(f.op, left, right) ??
          this.defaultInfo(result, [left, right]));
      return { result: this.lift(result, resultInfo) };
    }
  }

  templateConcatPre(_id: number, left: Lifted, right: Lifted) {
    const l = this.$.value(left);
    const r = this.$.value(right);
    const frame: BinFrame = { ty: 'bin', op: '+', left, right };
    return { left: l, right: r, skip: true, frame };
  }

  templateConcat(
    _id: number,
    _left: Lifted,
    _right: Lifted,
    result: Unlifted<unknown>,
    frame: unknown,
  ) {
    required(frame !== undefined, 'templateConcat hook missing frame');
    this.siteResolver.reportId(_id);
    const f = frame as BinFrame;
    return {
      result: SYNTAX__add(this.$, f.left, f.right) as Lifted<string>,
    };
  }

  unaryPre(_id: number, op: string, _prefix: boolean, operand: Lifted) {
    const e = this.$.value(operand);
    // +/-/~ coerce their operand natively (ToNumber/ToNumeric); shadow an object
    // operand's instrumented coercion methods first, restored in `unary`. Other
    // unary ops (!, typeof, void, delete) don't ToPrimitive an object.
    const escaped =
      op === '+' || op === '-' || op === '~'
        ? this.escaper.wrapForOperator([e])
        : undefined;
    const frame: UnFrame = { ty: 'un', op, operand, escaped };
    return { op, operand: e, skip: false, frame };
  }

  unary(
    _id: number,
    _op: string,
    _prefix: boolean,
    _operand: unknown,
    result: Unlifted<unknown>,
    frame: unknown,
  ) {
    required(frame !== undefined, 'unary hook missing frame');
    this.siteResolver.reportId(_id);
    const f = frame as UnFrame;
    if (f.escaped) this.escaper.restore(f.escaped); // unwrap operand coercion shadows
    const transformed: Lifted<unknown> = this.lift(
      result,
      this.unaryInfo?.(f.op, this.valued(f.operand)) ??
        this.defaultInfo(result, [this.valued(f.operand)]),
    );
    return { result: transformed };
  }

  getFieldPre(_id: number, base: any, prop: any) {
    const frame: GetFieldFrame = {
      ty: 'getField',
      base: base as Lifted,
      prop: prop as Lifted,
    };
    return {
      base: this.$.value(base as Lifted),
      prop: this.$.value(prop as Lifted),
      skip: false,
      frame,
    };
  }

  getField(
    _id: number,
    _base: any,
    _prop: any,
    result: any,
    _isPrivate: boolean,
    frame: unknown,
  ) {
    required(frame !== undefined, 'getField hook missing frame');
    this.siteResolver.reportId(_id);
    const transformed = (() => {
      const f = frame as GetFieldFrame;
      const b: unknown = this.$.value(f.base);
      const p: unknown = this.$.value(f.prop);
      if (typeof b === 'string') {
        const i: number | undefined = this.$.value(
          AO__CanonicalNumericIndexString(
            this.$,
            this.$.default((p as any).toString(), [f.prop]),
          ),
        );
        if (i !== undefined) {
          // A numeric index already carries `i` as its value, so pass it through
          // to keep any (possibly symbolic) index info — e.g. `r[r.length - 1]`
          // stays tied to the subject's symbolic length instead of collapsing to
          // the seed's concrete offset. A string key ("3") has no such info, so
          // route it through the canonical index `i`.
          const start =
            typeof p === 'number'
              ? (f.prop as Lifted<number>)
              : this.$.default(i, [f.prop]);
          return this.$.substring(
            f.base as Lifted<string>,
            start,
            this.$.default(i + 1, [f.prop]),
          );
        }
        if (p === 'length') {
          if (this.$.value(this.$.isType(f.base, 'string'))) {
            return this.lift(
              result,
              this.lengthOfStringInfo?.(
                this.valued(f.base as Lifted<string>),
              ) ?? this.defaultInfo(result, [this.valued(f.base)]),
            );
          } else {
            return this.lift(
              result,
              this.defaultInfo(result, [this.valued(f.base)]),
            );
          }
        }
      }
      if (
        this.isLifted(result) &&
        !this.domain.isBottom(this.getInfo(result))
      ) {
        return result as Lifted<unknown>;
      }
      return this.lift(
        result,
        this.getFieldInfo?.(
          this.valued(f.base),
          this.valued(f.prop),
          this.valued(result),
        ) ??
          this.defaultInfo(result, [this.valued(f.base), this.valued(f.prop)]),
      );
    })();
    return { result: transformed };
  }

  putFieldPre(_id: number, base: any, prop: any, value: any) {
    const rawBase: unknown = this.$.value(base as Lifted);
    let v: unknown = value;
    if (ArrayBuffer.isView(rawBase)) {
      v = this.$.value(value as Lifted);
    } else {
      this.escaper.markEscapable(value);
    }
    return {
      base: rawBase,
      prop: this.$.value(prop as Lifted),
      value: v,
      skip: false,
    };
  }

  // // Class field initializers store natively, like a putField.
  // fieldInit(_id: number, _obj: any, _key: any, _isStatic: boolean, value: any) {
  //   this.escaper.markEscapable(value);
  // }

  // the native instrumenter needs a raw string
  instrumentCodePre(_id: number, code: any, _isDirect: boolean) {
    return { code: this.$.value(code as Lifted), skip: false };
  }

  invokeFunPre(
    _id: number,
    _f: any,
    _base: any,
    args: any,
    _isConstructor: boolean,
    _isMethod: boolean,
  ) {
    this.siteResolver.reportId(_id);
    const argArr = Array.from(args) as Lifted[]; // can we do this without `as`?
    const entries: Lifted[] = _isMethod
      ? (concatList([_base], argArr) as Lifted[])
      : argArr;
    const kind = this.callKind(_f, entries);
    if (kind === 'modeled') {
      // A modeled builtin has no [[Construct]] unless esmeta stamped CONSTRUCTABLE
      // on its polyfill, so `new <method>()` throws like the native would. Without
      // this the model runs and returns a value, silently passing not-a-constructor.
      if (_isConstructor && !isConstructable(Model.ofBuiltin(_f))) {
        throw new TypeError(
          `${this.siteResolver.builtinName(_f)} is not a constructor`,
        );
      }
      // model takes lifted args and returns a lifted result; the engine skips
      // the native call (skip:true) and invokeFun runs the model.
      return {
        skip: true,
        f: _f,
        base: _base,
        args: argArr,
        frame: { ty: 'opaque', f: _f, modeled: true, entries, escaped: [] },
      };
    }

    // The callee reaches the engine's Function.prototype.apply site; a lifted
    // primitive (a symbolic value used as a function) would leak its proxy there
    // ("called on #<Object>") instead of raising an ordinary "not a function"
    // TypeError. Peek it: a raw non-callable produces the natural error, while
    // instrumented/native function callees peek to themselves (no-op).
    const callee = this.$.value(_f as Lifted);

    if (kind === 'opaque') {
      // RETURN-SIDE SEAM. A *blanket* unlift of every instrumented-function
      // arg/receiver's return is unsound and stays unhandled:
      //  - The boundary can't tell whether native will COERCE the return (wants
      //    raw) or STORE it as data and hand it back to instrumented code (wants
      //    lifted). A blanket unlift breaks the store path — e.g. unmodeled
      //    Array.prototype.flatMap would lose per-element info.
      //  - Unlike escape (which strips THEN restores into a container we own), a
      //    return lands in native's container: no restore point, so the unlift
      //    is permanent loss.
      //  - For native ToBoolean (e.g. unmodeled `every`) unlifting is anyway
      //    pointless (a raw bool carries no info; any object is truthy) — closed
      //    by MODELING the builtin, i.e. a wrapper scoped to a known callee.
      // The ONE return-side case that IS sound to wrap is coercion: native
      // OrdinaryToPrimitive calls the operand's valueOf/toString/@@toPrimitive
      // and REJECTS an object return ("Cannot convert object to primitive
      // value") — a lifted-primitive proxy is an object. Those three methods are
      // always coerced (never stored) and live on an operand we own, so escape()
      // shadows them with unlifting wrappers and restores after — see
      // BoundaryEscape.wrapCoercion.
      const esc = this.escaper.escape(_base, argArr, entries);
      // if (esc.crossed.length > 0)
      //   this.escapedInfo?.(
      //     _f,
      //     esc.crossed.map((w) => this.valued(w)),
      //   );
      return {
        skip: false,
        f: callee,
        base: esc.base,
        args: esc.args,
        frame: {
          ty: 'opaque',
          f: _f,
          modeled: false,
          entries,
          escaped: esc.log,
        },
      };
    }
    return {
      skip: false,
      f: callee,
      base: _base,
      args,
      frame: { ty: 'transparent', entries },
    };
  }

  invokeFun(
    _id: number,
    _f: any,
    _base: any,
    _args: any,
    result: any,
    _isConstructor: boolean,
    _isMethod: boolean,
    frame: unknown,
  ) {
    required(frame !== undefined, 'invokeFun hook missing frame');
    this.siteResolver.reportId(_id);
    const f = frame as CallFrame;
    if (f.ty === 'transparent')
      return { result: this.carryOrDefault(result, f.entries as Lifted[]) };
    // opaque: either the model runs now (the engine skipped the native call) or
    // we shape the value the native call returned.
    if (f.modeled)
      return {
        result: this.callModeled(_f, _base as Lifted, _args as Lifted[]),
      };
    return {
      result: this.opaqueResult(_f, f.entries as Lifted[], result, f.escaped),
    };
  }
}
