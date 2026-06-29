/** Marks/queries whether a modeled builtin has a [[Construct]] internal method
 *  (i.e. is a constructor). esmeta's polyfill codegen calls `markConstructable`
 *  on the generated intrinsic of every spec constructor; absence means
 *  non-constructor, so `new <modeled>()` throws a TypeError exactly like the
 *  native builtin would (see flow.ts invokeFunPre).
 *
 *  A leaf module on purpose: both flow.ts and the generated spec files import it,
 *  so it must not import anything that would close an import cycle. The lone
 *  symbol-index cast lives here, once, instead of at every call site. */
const CONSTRUCTABLE: unique symbol = Symbol.for('dynajs.constructable');

type Marked = { [CONSTRUCTABLE]?: boolean };

/** Stamp a generated constructor polyfill so the runtime permits `new`. */
export function markConstructable(fn: Function): void {
  (fn as Marked)[CONSTRUCTABLE] = true;
}

/** Whether `fn` was stamped as a constructor. */
export function isConstructable(fn: Function): boolean {
  return (fn as Marked)[CONSTRUCTABLE] === true;
}
