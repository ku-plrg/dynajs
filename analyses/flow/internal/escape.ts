import type { Lifted } from '../type.js';
import { isInstrumentedFn, CAPTURED } from '../utils.js';

// Captured up front (user code can override the Object/Reflect globals).
const {
  ReflectOwnKeys,
  ObjectGetOwnPropertyDescriptor,
  ObjectDefineProperty,
  ObjectIs,
} = CAPTURED;

export type EscapeRecord =
  // a lifted primitive stripped out of a container we own; restored in place
  | {
      kind: 'prop';
      container: object;
      prop: string | symbol;
      lifted: Lifted<unknown>;
    }
  // a coercion method temporarily shadowed by an unlifting wrapper; `prev` is
  // the displaced own descriptor (undefined ⇒ there was none, so delete on restore)
  | {
      kind: 'method';
      obj: object;
      key: string | symbol;
      prev: PropertyDescriptor | undefined;
    };

// Result of escaping one opaque call's receiver + args across the boundary.
export type Escaped = {
  base: unknown;
  args: unknown[];
  log: EscapeRecord[]; // in-place mutations, replayed by restore()
  crossed: Lifted<unknown>[]; // lifted primitives that left controlled code (for escapedInfo)
};

/** Strips lifted primitives out of values flowing into an uninstrumented
 * ("opaque") native call and restores them afterward.
 *
 * Array iteration here uses index loops, never `for…of` / spread: user code may
 * override `Array.prototype[Symbol.iterator]` with an instrumented function, and
 * iterating through it would re-enter the engine's binary/call hooks — which
 * re-enter this class — causing unbounded recursion. Reflection goes through the
 * CAPTURED natives for the same reason. */
export class BoundaryEscape {
  // Fast-path flag: until some store places a lifted primitive into a
  // container, the recursive scan is skipped entirely.
  private containersMayHoldLifted = false;

  // Fast-path flag: until some instrumented coercion method (valueOf/toString/
  // @@toPrimitive) is observed, the *nested* coercion-wrap walk is skipped.
  // Top-level operands are always wrapped (cheap), so this only gates recursion.
  private mayHaveInstrumentedCoercion = false;

  // valueOf/toString/@@toPrimitive — the methods native ToPrimitive invokes.
  private static readonly COERCION_KEYS: (string | symbol)[] = [
    'valueOf',
    'toString',
    Symbol.toPrimitive,
  ];

  constructor(
    private readonly isPrimitiveProxy: (v: unknown) => v is Lifted<unknown>,
    private readonly unlift: (w: Lifted<unknown>) => unknown,
    private readonly lift: (v: unknown) => Lifted<unknown>,
  ) {}

  markEscapable(value: unknown): void {
    if (!this.containersMayHoldLifted && this.isPrimitiveProxy(value)) {
      this.containersMayHoldLifted = true;
    }
  }

  /** Object/array literals store member expressions natively before any putField
   * fires; shallow-scan own props so both flags stay sound. A literal carrying a
   * lifted primitive arms the container walk; one whose valueOf/toString/
   * @@toPrimitive is an instrumented function arms the nested coercion walk
   * (each nested literal is scanned as it is created, so `{length:{valueOf}}`
   * arms it too). */
  markEscapableLiteral(value: unknown): void {
    if (typeof value !== 'object' || value === null) return;
    if (this.containersMayHoldLifted && this.mayHaveInstrumentedCoercion) return;
    const keys = ReflectOwnKeys(value);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const desc = ObjectGetOwnPropertyDescriptor(value, key);
      if (desc === undefined || !('value' in desc)) continue;
      if (!this.containersMayHoldLifted && this.isPrimitiveProxy(desc.value)) {
        this.containersMayHoldLifted = true;
      }
      if (
        !this.mayHaveInstrumentedCoercion &&
        BoundaryEscape.COERCION_KEYS.includes(key) &&
        typeof desc.value === 'function' &&
        isInstrumentedFn(desc.value)
      ) {
        this.mayHaveInstrumentedCoercion = true;
      }
    }
  }

  escape(base: unknown, args: Lifted[], entries: Lifted[]): Escaped {
    const log: EscapeRecord[] = [];
    const visited = new Set<object>();
    const escapedArgs = args.map((a) => this.escapeValue(a, log, visited));
    const escapedBase = this.escapeValue(base, log, visited);
    // `.filter`/`.flatMap`/`.concat` are index-based (no Symbol.iterator), so
    // they are safe; a spread (`[...a, ...b]`) would not be.
    const crossed = entries
      .filter((e) => this.isPrimitiveProxy(e))
      .concat(log.flatMap((e) => (e.kind === 'prop' ? [e.lifted] : [])));
    return { base: escapedBase, args: escapedArgs, log, crossed };
  }

  /** Wrap the coercion methods of values a native operator is about to coerce
   * (binary `<`/`==`/`^`/…, unary `+`/`-`/`~`), returning a log for restore().
   * Operators coerce their operands directly, so only the operands themselves
   * need wrapping. No-op (and no allocation cost beyond the array) unless the
   * program is known to define an instrumented coercion method. */
  wrapForOperator(values: unknown[]): EscapeRecord[] {
    if (!this.mayHaveInstrumentedCoercion) return [];
    const log: EscapeRecord[] = [];
    for (let i = 0; i < values.length; i++) this.wrapCoercion(values[i], log);
    return log;
  }

  restore(log: EscapeRecord[]): void {
    for (let i = 0; i < log.length; i++) {
      const e = log[i];
      if (e.kind === 'method') {
        if (e.prev === undefined)
          delete (e.obj as Record<string | symbol, unknown>)[e.key];
        else ObjectDefineProperty(e.obj, e.key, e.prev);
        continue;
      }
      const desc = ObjectGetOwnPropertyDescriptor(e.container, e.prop);
      if (
        desc !== undefined &&
        'value' in desc &&
        desc.writable === true &&
        ObjectIs(desc.value, this.unlift(e.lifted))
      ) {
        (e.container as Record<string | symbol, unknown>)[e.prop] = e.lifted;
      }
    }
  }

  private escapeValue(
    v: unknown,
    log: EscapeRecord[],
    visited: Set<object>,
  ): unknown {
    if (this.isPrimitiveProxy(v)) return this.unlift(v);
    if (typeof v === 'object' && v !== null) {
      // Top-level operand: native ToPrimitive (Number(v), v + x, v[k], …) calls
      // its coercion methods directly — always wrap (cheap), regardless of flags.
      this.wrapCoercion(v, log);
      if (this.containersMayHoldLifted || this.mayHaveInstrumentedCoercion) {
        this.escapeInto(v, log, visited);
      }
    }
    return v;
  }

  private escapeInto(
    obj: object,
    log: EscapeRecord[],
    visited: Set<object>,
  ): void {
    if (visited.has(obj)) return;
    visited.add(obj);
    const keys = ReflectOwnKeys(obj);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const desc = ObjectGetOwnPropertyDescriptor(obj, key);
      if (desc === undefined || !('value' in desc) || desc.writable !== true)
        continue;
      const child: unknown = desc.value;
      if (this.isPrimitiveProxy(child)) {
        (obj as Record<string | symbol, unknown>)[key] = this.unlift(child);
        log.push({ kind: 'prop', container: obj, prop: key, lifted: child });
      } else if (typeof child === 'object' && child !== null) {
        // A nested object native can reach may have its coercion methods called
        // (e.g. an array-like whose `length` is { valueOf }).
        if (this.mayHaveInstrumentedCoercion) this.wrapCoercion(child, log);
        this.escapeInto(child, log, visited);
      }
    }
  }

  /** Temporarily shadow `v`'s coercion methods with wrappers that unlift the
   * return, so native ToPrimitive receives a real primitive instead of a
   * lifted-primitive object. Only instrumented methods are touched — native
   * valueOf/toString already return raw. The shadow is an own property,
   * restored (deleted or reset) by restore(). */
  private wrapCoercion(v: unknown, log: EscapeRecord[]): void {
    if (v === null || (typeof v !== 'object' && typeof v !== 'function')) return;
    const obj = v as object;
    const keys = BoundaryEscape.COERCION_KEYS;
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      let orig: unknown;
      try {
        orig = (obj as Record<string | symbol, unknown>)[key]; // own or inherited
      } catch {
        continue; // exotic/throwing getter
      }
      if (typeof orig !== 'function' || !isInstrumentedFn(orig)) continue;
      this.mayHaveInstrumentedCoercion = true; // backstop: arm the nested walk
      const fn = orig as (...a: unknown[]) => Lifted<unknown>;
      const unlift = this.unlift;
      const lift = this.lift;
      const wrapper = function (this: unknown, ...a: unknown[]): unknown {
        return unlift(fn.apply(this, a.map((x) => lift(x))));
      };
      const prev = ObjectGetOwnPropertyDescriptor(obj, key);
      try {
        ObjectDefineProperty(obj, key, {
          value: wrapper,
          writable: true,
          enumerable: prev?.enumerable ?? false,
          configurable: true,
        });
      } catch {
        continue; // non-extensible / non-configurable own: leave as-is
      }
      log.push({ kind: 'method', obj, key, prev });
    }
  }
}
