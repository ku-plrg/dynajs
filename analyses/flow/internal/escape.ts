import type { Lifted } from '../type.js';

export type EscapeRecord = {
  container: object;
  prop: string | symbol;
  lifted: Lifted<unknown>;
};

// Result of escaping one opaque call's receiver + args across the boundary.
export type Escaped = {
  base: unknown;
  args: unknown[];
  log: EscapeRecord[]; // in-place container mutations, replayed by restore()
  crossed: Lifted<unknown>[]; // lifted primitives that left controlled code (for escapedInfo)
};

/** Strips lifted primitives out of values flowing into an uninstrumented
 * ("opaque") native call and restores them afterward */
export class BoundaryEscape {
  // Fast-path flag: until some store places a lifted primitive into a
  // container, the recursive scan is skipped entirely.
  private containersMayHoldLifted = false;

  constructor(
    private readonly isPrimitiveProxy: (v: unknown) => v is Lifted<unknown>,
    private readonly unlift: (w: Lifted<unknown>) => unknown,
  ) {}

  markEscapable(value: unknown): void {
    if (!this.containersMayHoldLifted && this.isPrimitiveProxy(value)) {
      this.containersMayHoldLifted = true;
    }
  }

  /** Object/array literals store member expressions natively before any putField
   * fires; shallow-scan own props so the flag stays sound. */
  markEscapableLiteral(value: unknown): void {
    if (
      this.containersMayHoldLifted ||
      typeof value !== 'object' ||
      value === null
    )
      return;
    for (const key of Reflect.ownKeys(value)) {
      const desc = Object.getOwnPropertyDescriptor(value, key);
      if (
        desc !== undefined &&
        'value' in desc &&
        this.isPrimitiveProxy(desc.value)
      ) {
        this.containersMayHoldLifted = true;
        return;
      }
    }
  }

  escape(base: unknown, args: Lifted[], entries: Lifted[]): Escaped {
    const log: EscapeRecord[] = [];
    const visited = new Set<object>();
    const escapedArgs = args.map((a) => this.escapeValue(a, log, visited));
    const escapedBase = this.escapeValue(base, log, visited);
    const crossed = [
      ...entries.filter((e) => this.isPrimitiveProxy(e)),
      ...log.map((e) => e.lifted),
    ];
    return { base: escapedBase, args: escapedArgs, log, crossed };
  }

  restore(log: EscapeRecord[]): void {
    for (const { container, prop, lifted } of log) {
      const desc = Object.getOwnPropertyDescriptor(container, prop);
      if (
        desc !== undefined &&
        'value' in desc &&
        desc.writable === true &&
        Object.is(desc.value, this.unlift(lifted))
      ) {
        (container as Record<string | symbol, unknown>)[prop] = lifted;
      }
    }
  }

  private escapeValue(
    v: unknown,
    log: EscapeRecord[],
    visited: Set<object>,
  ): unknown {
    if (this.isPrimitiveProxy(v)) return this.unlift(v);
    if (this.containersMayHoldLifted && typeof v === 'object' && v !== null) {
      this.escapeInto(v, log, visited);
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
    for (const key of Reflect.ownKeys(obj)) {
      const desc = Object.getOwnPropertyDescriptor(obj, key);
      if (desc === undefined || !('value' in desc) || desc.writable !== true)
        continue;
      const child: unknown = desc.value;
      if (this.isPrimitiveProxy(child)) {
        (obj as Record<string | symbol, unknown>)[key] = this.unlift(child);
        log.push({ container: obj, prop: key, lifted: child });
      } else if (typeof child === 'object' && child !== null) {
        this.escapeInto(child, log, visited);
      }
    }
  }
}
