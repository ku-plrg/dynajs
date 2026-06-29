import type { DynaJSType } from '../../src/analysis.js';

declare const D$: DynaJSType;

/* siimilar to `assert`, but this blames the caller of function */
export function required(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`[ERROR] ${message}`);
  }
}

export function isInstrumentedFn(f: unknown): boolean {
  return D$.isInstrumented?.(f) ?? false;
}


/** to capture built-in objects that may be overridden by user code. */
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
  // [[DefineOwnProperty]] seam ($.defineOwnProperty): returns a boolean (false on
  // failure) rather than throwing like Object.defineProperty does.
  ReflectDefineProperty: Reflect.defineProperty,
  ObjectIs: Object.is,
  // Calls into native/user functions with an args *array* — CreateListFrom
  // ArrayLike (length+index), so unlike `fn.call(t, ...arr)` it never dispatches
  // through the (overridable) Array.prototype[Symbol.iterator].
  ReflectApply: Reflect.apply,
});

// Build `[...heads, ...tail]` without spread/iterator (user code can poison
// `Array.prototype[Symbol.iterator]`). Elements are written with defineProperty
// (CreateDataProperty), not `out[i] = v`: a plain assignment is a [[Set]] that
// consults the prototype, so an index accessor on `Array.prototype` (e.g.
// `Object.defineProperty(Array.prototype, "2", {get})`) would hijack or throw
// ("…which has only a getter"). defineProperty defines an own data property
// directly, exactly like the spread it replaces.
export function concatList(heads: unknown[], tail: ArrayLike<unknown>): unknown[] {
  const out: unknown[] = [];
  let n = 0;
  const put = (v: unknown) =>
    CAPTURED.ObjectDefineProperty(out, n++, {
      value: v,
      writable: true,
      enumerable: true,
      configurable: true,
    });
  for (let i = 0; i < heads.length; i++) put(heads[i]);
  for (let i = 0; i < tail.length; i++) put(tail[i]);
  return out;
}