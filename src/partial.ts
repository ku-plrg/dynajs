
// -----------------------------------------------------------------------------
// adaptive instrumentation: parse analysis file to determine needed hooks
// -----------------------------------------------------------------------------
import type { Analysis } from './types/analysis.js';

type Unpartial<T> = {
  [K in keyof T]-?: T[K];
};

export type CallbacksOnly = Omit<Analysis, 'result'>;

export type CallbackHint = Record<keyof CallbacksOnly, boolean>;

export const callbackHintFull: Record<keyof Unpartial<CallbacksOnly>, true> = {
  endExecution: true,
  scriptEnter: true,
  scriptExit: true,
  invokeFunPre: true,
  invokeFun: true,
  taggedTemplatePre: true,
  taggedTemplate: true,
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
  staticBlockEnter: true,
  staticBlockExit: true,
};

export const callbackHintEmpty: Record<keyof Unpartial<CallbacksOnly>, false> = Object.fromEntries(Object.keys(callbackHintFull).map(k => [k, false])) as Record<keyof Unpartial<CallbacksOnly>, false>;

export class PartialChecker {
  callbackHint: CallbackHint;
  constructor(callbackHint: CallbackHint | undefined) { 
    this.callbackHint = callbackHint ?? callbackHintFull;
  }

  get shouldWrapThrow() {
    return true;
  }

  // TODO - set as true temporairily
  get P() { return true; }
  get G() { return true; }
  get De() { return true; }
  get Aw() { return true; }
  get Y() { return true; }
  get F() { return true; }
  get L() { return true; }
  get U() { return true; }
  get W() { return true; }
  get Th() { return true; }
  get B() { return true; }
  get D() { return true; }
  get R() { return true; }
  get C() { return true; }
  get Re() { return true; }
  get O() { return true; }
  get E() { return true; }
  get Fe() { return true; }
  get TF() { return true; }
  get S() { return true; }
  get Se() { return true; }
  get SBe() { return true; }
  get Fi() { return true; }
}
