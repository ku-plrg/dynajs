// This file is used to capture built-in objects that may be overridden by user code.
export const CAPTURED = Object.freeze({
  FunctionConstructor: Function,
  FunctionToString: Function.prototype.toString,
  // Reflection used by framework internals (e.g. BoundaryEscape). User code can
  // override the Object/Reflect globals or their methods, so capture them up
  // front. (Array iteration uses index loops instead — `for…of` always
  // dispatches through the live, overridable Array.prototype[Symbol.iterator].)
  ReflectOwnKeys: Reflect.ownKeys,
  ObjectGetOwnPropertyDescriptor: Object.getOwnPropertyDescriptor,
  ObjectDefineProperty: Object.defineProperty,
  ObjectIs: Object.is,
});
