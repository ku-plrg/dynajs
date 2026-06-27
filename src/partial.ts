// -----------------------------------------------------------------------------
// adaptive instrumentation: parse analysis file to determine needed hooks
// -----------------------------------------------------------------------------
import type { Analysis } from './types/analysis.js';
import type * as acorn from 'acorn';

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

export class PartialChecker {
  callbackHint: CallbackHint;
  constructor(callbackHint: CallbackHint | undefined) {
    this.callbackHint = callbackHint ?? callbackHintFull;
  }

  get shouldWrapThrow() {
    // hooks using uncaughtException: X, Ce, Sx, Fx;
    // consumers of uncaughtException
    return this.callbackHint.functionExit || this.callbackHint.scriptExit;
  }

  get declare() {
    return this.callbackHint.declare;
  }
  get scriptEnter() {
    return this.callbackHint.scriptEnter;
  }
  get scriptExit() {
    return this.callbackHint.scriptExit;
  }

  get P() {
    return (
      this.callbackHint.putFieldPre ||
      this.callbackHint.putField ||
      this.callbackHint.memoryWrite
    );
  }
  get G() {
    return (
      this.callbackHint.getFieldPre ||
      this.callbackHint.getField ||
      this.callbackHint.memoryAccess
    );
  }
  get De() {
    return this.callbackHint._deletePre || this.callbackHint._delete;
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

  literal(
    node:
      | acorn.Literal
      | acorn.ArrayExpression
      | acorn.ObjectExpression
      | acorn.FunctionExpression
      | acorn.ClassExpression
      | acorn.TemplateLiteral
      | acorn.ArrowFunctionExpression,
  ): boolean {
    if (this.callbackHint.literal) return true;

    switch (node.type) {
      case 'Literal':
        if (this.callbackHint.numberLiteral && typeof node.value === 'number')
          return true;
        if (this.callbackHint.bigintLiteral && typeof node.value === 'bigint')
          return true;
        if (this.callbackHint.stringLiteral && typeof node.value === 'string')
          return true;
        if (this.callbackHint.booleanLiteral && typeof node.value === 'boolean')
          return true;
        if (this.callbackHint.nullLiteral && node.value === null) return true;
        if (this.callbackHint.regexpLiteral && node.regex) return true;
        break;
      case 'ArrayExpression':
        if (this.callbackHint.arrayLiteral) return true;
        break;
      case 'ObjectExpression':
        if (this.callbackHint.objectLiteral) return true;
        break;
      case 'FunctionExpression':
      case 'ArrowFunctionExpression':
        if (this.callbackHint.functionLiteral) return true;
        break;
      case 'ClassExpression':
        if (this.callbackHint.functionLiteral) return true;
        break;
      case 'TemplateLiteral':
        if (this.callbackHint.functionLiteral) return true;
        break;
    }

    return false;
  }

  get W() {
    return this.callbackHint.write || this.callbackHint.memoryWrite;
  }

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
  get Th() {
    return this.callbackHint._throw;
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

  get R() {
    return this.callbackHint.read || this.callbackHint.memoryAccess;
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
  get Re() {
    return this.callbackHint._return;
  }
  get forLoopRhsObj() {
    return this.callbackHint.forInOfObject;
  }
  get E() {
    return this.callbackHint.endExpression;
  }
  get Fe() {
    return this.callbackHint.functionEnter || this.callbackHint.functionExit;
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
  get S() {
    return this.callbackHint.scriptEnter || this.callbackHint.scriptExit;
  }

  get Fi() {
    return this.callbackHint.fieldInit;
  }
  get Su() {
    return this.callbackHint.superCallPre || this.callbackHint.superCall;
  }
  get Sm() {
    return (
      this.callbackHint.superMethodCallPre || this.callbackHint.superMethodCall
    );
  }
  get Gs() {
    return (
      this.callbackHint.superGetFieldPre || this.callbackHint.superGetField
    );
  }
  get Ps() {
    return (
      this.callbackHint.superPutFieldPre || this.callbackHint.superPutField
    );
  }
  get Ev() {
    return (
      this.callbackHint.instrumentCodePre || this.callbackHint.instrumentCode
    );
  }
}
