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
  ObjectIs: Object.is,
  // Calls into native/user functions with an args *array* — CreateListFrom
  // ArrayLike (length+index), so unlike `fn.call(t, ...arr)` it never dispatches
  // through the (overridable) Array.prototype[Symbol.iterator].
  ReflectApply: Reflect.apply,
});

// Build `[...heads, ...tail]` without spread/iterator — user code can poison
// `Array.prototype[Symbol.iterator]`, which would otherwise break (or silently
// mis-fill) the framework's call-path arrays. Index reads/writes only.
export function concatList(heads: unknown[], tail: ArrayLike<unknown>): unknown[] {
  const out: unknown[] = [];
  for (let i = 0; i < heads.length; i++) out[i] = heads[i];
  const off = heads.length;
  for (let i = 0; i < tail.length; i++) out[off + i] = tail[i];
  return out;
}