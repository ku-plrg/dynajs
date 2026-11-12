// This file is used to capture built-in objects that may be overridden by user code.
export const CAPTURED = Object.freeze({
  FunctionConstructor: Function,
  FunctionToString: Function.prototype.toString,
  IndirectEval: eval,
  // bound at load time so later patches to Set/WeakMap.prototype (e.g. by a
  // page polyfill like es6-shim) or Function.prototype.call cannot reach the
  // runtime's own bookkeeping, which would re-enter the hooks
  SetHas: Function.prototype.call.bind(Set.prototype.has) as (
    set: Set<unknown>,
    value: unknown,
  ) => boolean,
  WeakMapGet: Function.prototype.call.bind(WeakMap.prototype.get) as (
    map: WeakMap<object, unknown>,
    key: object,
  ) => unknown,
  WeakMapSet: Function.prototype.call.bind(WeakMap.prototype.set) as (
    map: WeakMap<object, unknown>,
    key: object,
    value: unknown,
  ) => unknown,
});
