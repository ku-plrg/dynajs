// -----------------------------------------------------------------------------
// analysis callback types
// -----------------------------------------------------------------------------
export type Analysis = {
  endExecution?: () => void;
  scriptEnter?: (
    id: number,
    instrumentedPath: string,
    originalPath: string
  ) => void;
  scriptExit?: (
    id: number,
    exc?: { exception: any }
  ) => void;
  invokeFunPre?: (
    id: number,
    f: any,
    base: any,
    args: any,
    isConstructor: boolean,
    isMethod: boolean
  ) => { f: any, base: any, args: any, skip: boolean } | void;
  invokeFun?: (
    id: number,
    f: any,
    base: any,
    args: any,
    result: any,
    isConstructor: boolean,
    isMethod: boolean
  ) => { result: any } | void;
  taggedTemplatePre?: (
    id: number,
    f: any,
    base: any,
    strings: any,
    values: any[],
    isMethod: boolean
  ) => { f: any, base: any, strings: any, values: any[], skip: boolean } | void;
  taggedTemplate?: (
    id: number,
    f: any,
    base: any,
    strings: any,
    values: any[],
    result: any,
    isMethod: boolean
  ) => { result: any } | void;
  functionEnter?: (
    id: number,
    f: any,
    base: any,
    args: any,
    isAsync: boolean,
    isGenerator: boolean
  ) => void;
  functionExit?: (
    id: number,
    returnValue: any,
    exception: { exception: any } | undefined,
    isAsync: boolean,
    isGenerator: boolean
  ) => void;
  _return?: (
    id: number,
    value: any
  ) => { result: any } | void;
  forInOfObject?: (
    id: number,
    value: any,
    isForIn: boolean
  ) => { result: any } | void;
  endExpression?: (
    id: number,
    value: any
  ) => void;
  getFieldPre?: (
    id: number,
    base: any,
    prop: any
  ) => { base: any, prop: any, skip: boolean } | void;
  getField?: (
    id: number,
    base: any,
    prop: any,
    result: any
  ) => { result: any } | void;
  putFieldPre?: (
    id: number,
    base: any,
    prop: any,
    value: any
  ) => { base: any, prop: any, value: any, skip: boolean } | void;
  putField?: (
    id: number,
    base: any,
    prop: any,
    value: any
  ) => { result: any } | void;
  _deletePre?: (
    id: number,
    base: any,
    prop: any
  ) => { base: any, prop: any, skip: boolean } | void;
  _delete?: (
    id: number,
    base: any,
    prop: any,
    value: boolean
  ) => { result: boolean } | void;
  unaryPre?: (
    id: number,
    op: string,
    prefix: boolean,
    operand: any
  ) => { op: string, operand: any, skip: boolean } | void;
  unary?: (
    id: number,
    op: string,
    prefix: boolean,
    operand: any,
    result: any
  ) => { result: any } | void;
  arithmeticUnaryPre?: (id: number, op: string, prefix: boolean, operand: any) => { op: string, operand: any, skip: boolean } | void;
  arithmeticUnary?: (id: number, op: string, prefix: boolean, operand: any, result: any) => { result: any } | void;
  logicalUnaryPre?: (id: number, op: string, prefix: boolean, operand: any) => { op: string, operand: any, skip: boolean } | void;
  logicalUnary?: (id: number, op: string, prefix: boolean, operand: any, result: any) => { result: any } | void;
  bitwiseUnaryPre?: (id: number, op: string, prefix: boolean, operand: any) => { op: string, operand: any, skip: boolean } | void;
  bitwiseUnary?: (id: number, op: string, prefix: boolean, operand: any, result: any) => { result: any } | void;
  typeofUnaryPre?: (id: number, op: string, prefix: boolean, operand: any) => { op: string, operand: any, skip: boolean } | void;
  typeofUnary?: (id: number, op: string, prefix: boolean, operand: any, result: any) => { result: any } | void;
  voidUnaryPre?: (id: number, op: string, prefix: boolean, operand: any) => { op: string, operand: any, skip: boolean } | void;
  voidUnary?: (id: number, op: string, prefix: boolean, operand: any, result: any) => { result: any } | void;
  updateUnaryPre?: (id: number, op: string, prefix: boolean, operand: any) => { op: string, operand: any, skip: boolean } | void;
  updateUnary?: (id: number, op: string, prefix: boolean, operand: any, result: any) => { result: any } | void;
  binaryPre?: (
    id: number,
    op: string,
    left: any,
    right: any
  ) => { op: string, left: any, right: any, skip: boolean } | void;
  binary?: (
    id: number,
    op: string,
    left: any,
    right: any,
    result: any
  ) => { result: any } | void;
  arithmeticBinaryPre?: (
    id: number,
    op: string,
    left: any,
    right: any
  ) => { op: string, left: any, right: any, skip: boolean } | void;
  arithmeticBinary?: (
    id: number,
    op: string,
    left: any,
    right: any,
    result: any
  ) => { result: any } | void;
  comparisonBinaryPre?: (
    id: number,
    op: string,
    left: any,
    right: any
  ) => { op: string, left: any, right: any, skip: boolean } | void;
  comparisonBinary?: (
    id: number,
    op: string,
    left: any,
    right: any,
    result: any
  ) => { result: any } | void;
  bitwiseBinaryPre?: (
    id: number,
    op: string,
    left: any,
    right: any
  ) => { op: string, left: any, right: any, skip: boolean } | void;
  bitwiseBinary?: (
    id: number,
    op: string,
    left: any,
    right: any,
    result: any
  ) => { result: any } | void;
  condition?: (
    id: number,
    op: string,
    value: any
  ) => { result: any } | void;
  ifCondition?: (id: number, value: any) => { result: any } | void;
  whileCondition?: (id: number, value: any) => { result: any } | void;
  forCondition?: (id: number, value: any) => { result: any } | void;
  ternaryCondition?: (id: number, value: any) => { result: any } | void;
  logicalAnd?: (id: number, value: any) => { result: any } | void;
  logicalOr?: (id: number, value: any) => { result: any } | void;
  nullishCoalescing?: (id: number, value: any) => { result: any } | void;
  optionalChain?: (id: number, value: any) => { result: any } | void;
  switchCondition?: (id: number, value: any) => { result: any } | void;
  declare?: (
    id: number,
    name: string,
    kind: string,
    init: boolean,
    value: any,
    isSpread: boolean
  ) => void;
  memoryAccess?: (id: number, value: any) => { result: any } | void;
  read?: (
    id: number,
    name: string,
    value: any
  ) => { result: any } | void;
  memoryWrite?: (id: number, value: any) => { result: any } | void;
  write?: (
    id: number,
    names: string[],
    value: any
  ) => { result: any } | void;
  literal?: (
    id: number,
    value: any
  ) => { result: any } | void;
  numberLiteral?: (id: number, value: any) => { result: any } | void;
  bigintLiteral?: (id: number, value: any) => { result: any } | void;
  stringLiteral?: (id: number, value: any) => { result: any } | void;
  booleanLiteral?: (id: number, value: any) => { result: any } | void;
  nullLiteral?: (id: number, value: any) => { result: any } | void;
  regexpLiteral?: (id: number, value: any) => { result: any } | void;
  arrayLiteral?: (id: number, value: any) => { result: any } | void;
  objectLiteral?: (id: number, value: any) => { result: any } | void;
  functionLiteral?: (id: number, value: any) => { result: any } | void;
  _throw?: (
    id: number,
    val: any
  ) => { result: any } | void;
  _yield?: (
    id: number,
    value: any,
    isDelegate: boolean
  ) => { result: any } | void;
  _resume?: (
    id: number,
    value: any
  ) => { result: any } | void;
  _await?: (
    id: number,
    value: any
  ) => { result: any } | void;
  _awaitResult?: (
    id: number,
    value: any
  ) => { result: any } | void;
  fieldInit?: (
    id: number,
    obj: any,
    key: any,
    isStatic: boolean,
    value: any
  ) => { result: any } | void;
  staticBlockEnter?: (id: number, cls: any) => void;
  staticBlockExit?: (id: number) => void;
  result?: any;
}
