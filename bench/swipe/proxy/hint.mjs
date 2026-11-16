// Partial-mode hint for the DynaJS instrumenter from a list of analysis
// callback names. A hint must name every callback DynaJS knows
// (src/partial.ts callbackHintFull): true for the ones the analysis implements.
export const CALLBACKS = 'endExecution scriptEnter scriptExit invokeFunPre invokeFun taggedTemplatePre taggedTemplate templateConcatPre templateConcat functionEnter functionExit _return forInOfObject endExpression getFieldPre getField putFieldPre putField _deletePre _delete unaryPre unary arithmeticUnaryPre arithmeticUnary logicalUnaryPre logicalUnary bitwiseUnaryPre bitwiseUnary typeofUnaryPre typeofUnary voidUnaryPre voidUnary updateUnaryPre updateUnary binaryPre binary arithmeticBinaryPre arithmeticBinary comparisonBinaryPre comparisonBinary bitwiseBinaryPre bitwiseBinary condition classHeritage ifCondition whileCondition forCondition ternaryCondition logicalAnd logicalOr nullishCoalescing optionalChain switchCondition declare memoryAccess read memoryWrite write literal numberLiteral bigintLiteral stringLiteral booleanLiteral nullLiteral regexpLiteral arrayLiteral objectLiteral functionLiteral _throw _yield _resume _await _awaitResult fieldInit superCallPre superCall superMethodCallPre superMethodCall superGetFieldPre superGetField superPutFieldPre superPutField instrumentCodePre instrumentCode'.split(' ');

/** comma-separated callback names -> CallbackHint; undefined -> full mode */
export function makeHint(list) {
  if (list === undefined) return undefined;
  const on = new Set(list.split(',').filter(Boolean));
  for (const h of on) if (!CALLBACKS.includes(h)) throw new Error(`unknown callback ${h}`);
  return Object.fromEntries(CALLBACKS.map((k) => [k, on.has(k)]));
}
