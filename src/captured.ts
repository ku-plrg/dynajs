// This file is used to capture built-in objects that may be overridden by user code.
export const CAPTURED = Object.freeze({
  FunctionConstructor: Function,
  FunctionToString: Function.prototype.toString,
  IndirectEval: eval,
});
