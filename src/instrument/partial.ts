// -----------------------------------------------------------------------------
// adaptive instrumentation: parse analysis file to determine needed hooks
// -----------------------------------------------------------------------------
import type { Analysis } from '../types/analysis.js';
import type * as Hooks from '../runtime/hooks.js';

type Unpartial<T> = {
  [K in keyof T]-?: T[K];
};

export type CallbacksOnly = Omit<Analysis, 'result' | 'spec'>;

export type CallbackHint = Record<keyof CallbacksOnly, boolean>;

export const callbackHintFull: Record<keyof Unpartial<CallbacksOnly>, true> = {
  endExecution: true,
  scriptEnter: true,
  scriptExit: true,
  invokeFunPre: true,
  invokeFun: true,
  taggedTemplatePre: true,
  taggedTemplate: true,
  templateConcatPre: true,
  templateConcat: true,
  functionEnter: true,
  functionExit: true,
  _return: true,
  forInOfObject: true,
  endExpression: true,
  spread: true,
  getFieldPre: true,
  getField: true,
  putFieldPre: true,
  putField: true,
  _deletePre: true,
  _delete: true,
  unaryPre: true,
  unary: true,
  arithmeticUnaryPre: true,
  arithmeticUnary: true,
  logicalUnaryPre: true,
  logicalUnary: true,
  bitwiseUnaryPre: true,
  bitwiseUnary: true,
  typeofUnaryPre: true,
  typeofUnary: true,
  voidUnaryPre: true,
  voidUnary: true,
  updateUnaryPre: true,
  updateUnary: true,
  binaryPre: true,
  binary: true,
  arithmeticBinaryPre: true,
  arithmeticBinary: true,
  comparisonBinaryPre: true,
  comparisonBinary: true,
  bitwiseBinaryPre: true,
  bitwiseBinary: true,
  condition: true,
  classHeritage: true,
  ifCondition: true,
  whileCondition: true,
  forCondition: true,
  ternaryCondition: true,
  logicalAnd: true,
  logicalOr: true,
  nullishCoalescing: true,
  optionalChain: true,
  switchCondition: true,
  declare: true,
  memoryAccess: true,
  read: true,
  memoryWrite: true,
  write: true,
  literal: true,
  numberLiteral: true,
  bigintLiteral: true,
  stringLiteral: true,
  booleanLiteral: true,
  nullLiteral: true,
  regexpLiteral: true,
  arrayLiteral: true,
  objectLiteral: true,
  functionLiteral: true,
  _throw: true,
  _yield: true,
  _resume: true,
  _await: true,
  _awaitResult: true,
  fieldInit: true,
  superCallPre: true,
  superCall: true,
  superMethodCallPre: true,
  superMethodCall: true,
  superGetFieldPre: true,
  superGetField: true,
  superPutFieldPre: true,
  superPutField: true,
  instrumentCodePre: true,
  instrumentCode: true,
};

export const callbackHintEmpty: Record<keyof Unpartial<CallbacksOnly>, false> =
  Object.fromEntries(
    Object.keys(callbackHintFull).map((k) => [k, false]),
  ) as Record<keyof Unpartial<CallbacksOnly>, false>;

// Every getter/method below names a runtime hook exported from runtime/hooks.ts
// (D$.<name>): the gate answers "must this hook be emitted for the requested
// callbacks?". The 1:1 with the hook surface is enforced at the bottom of the file
// (see `_NoMissingGate` / `_NoStrayGate`, mirroring src/instrument/_check.ts).
//
// Three shapes of gate:
//   - primary — a real callbackHint disjunction, consulted at the emit site.
//   - delegating — a hook grouped with a primary (e.g. `M`/`Mp` ride `F`, `Fx`
//     rides `Fe`): the instrumenter gates the whole family on the primary.
//   - always-on — a hook emitted unconditionally (its getter is `true`), kept only
//     to hold the 1:1; the instrumenter never reads it.
export class PartialChecker {
  callbackHint: CallbackHint;
  constructor(callbackHint: CallbackHint | undefined) {
    this.callbackHint = callbackHint ?? callbackHintFull;
  }

  // Not a hook: whether a function/script body needs a try/catch to propagate an
  // uncaught exception out to functionExit/scriptExit. Consumers: X, Ce, Fx.
  get shouldWrapThrow() {
    return this.callbackHint.functionExit || this.callbackHint.scriptExit;
  }

  // --- script ---
  get Se() {
    return this.callbackHint.scriptEnter;
  }
  get Sx() {
    return this.callbackHint.scriptExit;
  }

  // --- calls ---
  // Function-constructor interception (for instrumentCodePre/instrumentCode on
  // `new Function(...)` bodies) happens inside the invokeFun runtime helper,
  // so call sites must be wrapped whenever eval hooks are requested too.
  get F() {
    return (
      this.callbackHint.invokeFunPre ||
      this.callbackHint.invokeFun ||
      this.callbackHint.instrumentCodePre ||
      this.callbackHint.instrumentCode
    );
  }
  get M() {
    return this.F;
  }
  get Mp() {
    return this.F;
  }
  // invokeFun callbacks also fire for tagged-template call sites (TF coerces to F)
  get TF() {
    return (
      this.callbackHint.taggedTemplatePre ||
      this.callbackHint.taggedTemplate ||
      this.callbackHint.invokeFunPre ||
      this.callbackHint.invokeFun
    );
  }
  get TM() {
    return this.TF;
  }
  get TMp() {
    return this.TF;
  }

  // --- functions ---
  get Fe() {
    return this.callbackHint.functionEnter || this.callbackHint.functionExit;
  }
  get Fx() {
    return this.Fe;
  }
  get Re() {
    return this.callbackHint._return;
  }
  get O() {
    return this.callbackHint.forInOfObject;
  }

  // --- expressions / spread ---
  get E() {
    return this.callbackHint.endExpression;
  }
  get Sp() {
    return this.callbackHint.spread;
  }

  // --- member access ---
  get G() {
    return (
      this.callbackHint.getFieldPre ||
      this.callbackHint.getField ||
      this.callbackHint.memoryAccess
    );
  }
  get Gp() {
    return this.G;
  }
  get P() {
    return (
      this.callbackHint.putFieldPre ||
      this.callbackHint.putField ||
      this.callbackHint.memoryWrite
    );
  }
  get Pp() {
    return this.P;
  }
  get De() {
    return this.callbackHint._deletePre || this.callbackHint._delete;
  }
  // chain boundary (D$.Ch) is emitted only around an optional member / call /
  // delete that is itself hooked — see needsChainBoundary.
  get Ch() {
    return this.G || this.F || this.De;
  }

  // --- operators ---
  get U() {
    return (
      this.callbackHint.unaryPre ||
      this.callbackHint.unary ||
      this.callbackHint.arithmeticUnaryPre ||
      this.callbackHint.arithmeticUnary ||
      this.callbackHint.logicalUnaryPre ||
      this.callbackHint.logicalUnary ||
      this.callbackHint.bitwiseUnaryPre ||
      this.callbackHint.bitwiseUnary ||
      this.callbackHint.typeofUnaryPre ||
      this.callbackHint.typeofUnary ||
      this.callbackHint.voidUnaryPre ||
      this.callbackHint.voidUnary ||
      this.callbackHint.updateUnaryPre ||
      this.callbackHint.updateUnary
    );
  }
  get Up() {
    return this.U;
  }
  get B() {
    return (
      this.callbackHint.binaryPre ||
      this.callbackHint.binary ||
      this.callbackHint.arithmeticBinaryPre ||
      this.callbackHint.arithmeticBinary ||
      this.callbackHint.comparisonBinaryPre ||
      this.callbackHint.comparisonBinary ||
      this.callbackHint.bitwiseBinaryPre ||
      this.callbackHint.bitwiseBinary ||
      this.callbackHint.switchCondition
    );
  }
  get C() {
    return (
      this.callbackHint.condition ||
      this.callbackHint.ifCondition ||
      this.callbackHint.whileCondition ||
      this.callbackHint.forCondition ||
      this.callbackHint.ternaryCondition ||
      this.callbackHint.logicalAnd ||
      this.callbackHint.logicalOr ||
      this.callbackHint.nullishCoalescing ||
      this.callbackHint.optionalChain ||
      this.callbackHint.switchCondition
    );
  }
  // a switch discriminant/case desugars to D$.C('switch', D$.B('===', …))
  get Swl() {
    return this.B || this.C;
  }
  get Swr() {
    return this.B || this.C;
  }

  // --- variables ---
  get D() {
    return this.callbackHint.declare;
  }
  get R() {
    return this.callbackHint.read || this.callbackHint.memoryAccess;
  }
  get W() {
    return this.callbackHint.write || this.callbackHint.memoryWrite;
  }

  // --- literals ---
  // coarse like U/B: any literal-family callback turns the gate on, and the runtime
  // L hook dispatches to the type-specific callback (numberLiteral/stringLiteral/…)
  // by `typeof value`; a literal whose type callback is unimplemented no-ops there.
  get L() {
    return (
      this.callbackHint.literal ||
      this.callbackHint.numberLiteral ||
      this.callbackHint.bigintLiteral ||
      this.callbackHint.stringLiteral ||
      this.callbackHint.booleanLiteral ||
      this.callbackHint.nullLiteral ||
      this.callbackHint.regexpLiteral ||
      this.callbackHint.arrayLiteral ||
      this.callbackHint.objectLiteral ||
      this.callbackHint.functionLiteral
    );
  }

  // --- control flow ---
  get Th() {
    return this.callbackHint._throw;
  }
  get Y() {
    return (
      this.callbackHint._yield ||
      this.callbackHint._resume ||
      this.callbackHint.invokeFunPre ||
      this.callbackHint.invokeFun ||
      this.callbackHint.functionEnter ||
      this.callbackHint.functionExit
    );
  }
  get Yr() {
    return this.Y;
  }
  get Aw() {
    return (
      this.callbackHint._await ||
      this.callbackHint._awaitResult ||
      this.callbackHint.invokeFunPre ||
      this.callbackHint.invokeFun ||
      this.callbackHint.functionEnter ||
      this.callbackHint.functionExit
    );
  }
  get Awr() {
    return this.Aw;
  }

  // --- class fields ---
  get Fi() {
    return this.callbackHint.fieldInit;
  }

  // --- super ---
  get Su() {
    return this.callbackHint.superCallPre || this.callbackHint.superCall;
  }
  get Sm() {
    return (
      this.callbackHint.superMethodCallPre || this.callbackHint.superMethodCall
    );
  }
  get Gs() {
    return this.callbackHint.superGetFieldPre || this.callbackHint.superGetField;
  }
  get Ps() {
    return this.callbackHint.superPutFieldPre || this.callbackHint.superPutField;
  }

  // --- eval ---
  get Ev() {
    return (
      this.callbackHint.instrumentCodePre || this.callbackHint.instrumentCode
    );
  }

  // --- always-on hooks (emitted unconditionally; getters kept only for the 1:1
  //     with runtime/hooks.ts, never read by the instrumenter) ---
  // Hc: `extends E` is always unlifted so native class machinery sees a raw
  //   constructor/null. Ce: catch-enter always clears uncaughtException. TL:
  //   template concat. Lcs/Lcv: completion-value tracking. X: uncaught-exception
  //   recording (module declaration chunks wrap unconditionally ⇒ gate is ⊤).
  get Hc() {
    return true;
  }
  get Ce() {
    return true;
  }
  get TL() {
    return true;
  }
  get Lcs() {
    return true;
  }
  get Lcv() {
    return true;
  }
  get X() {
    return true;
  }
}
