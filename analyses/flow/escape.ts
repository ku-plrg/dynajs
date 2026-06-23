import type { Wrapped } from './type.js';

export type EscapeRecord = {
  container: object;
  prop: string | symbol;
  wrapped: Wrapped<unknown>;
};

// Result of escaping one opaque call's receiver + args across the boundary.
export type Escaped = {
  base: unknown;
  args: unknown[];
  log: EscapeRecord[]; // in-place container mutations, replayed by restore()
  crossed: Wrapped<unknown>[]; // wrapped primitives that left controlled code (for escapedInfo)
};

/** Strips wrapped primitives out of values flowing into an uninstrumented
 * ("opaque") native call and restores them afterward */
export class BoundaryEscape {
  // Fast-path flag: until some store places a wrapped primitive into a
  // container, the recursive scan is skipped entirely.
  private containersMayHoldWrapped = false;

  constructor(
    private readonly isPrimitiveProxy: (v: unknown) => v is Wrapped<unknown>,
    private readonly unwrap: (w: Wrapped<unknown>) => unknown,
  ) {}

  markEscapable(value: unknown): void {
    if (!this.containersMayHoldWrapped && this.isPrimitiveProxy(value)) {
      this.containersMayHoldWrapped = true;
    }
  }

  /** Object/array literals store member expressions natively before any putField
   * fires; shallow-scan own props so the flag stays sound. */
  markEscapableLiteral(value: unknown): void {
    if (
      this.containersMayHoldWrapped ||
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
        this.containersMayHoldWrapped = true;
        return;
      }
    }
  }

  escape(base: unknown, args: Wrapped[], entries: Wrapped[]): Escaped {
    const log: EscapeRecord[] = [];
    const visited = new Set<object>();
    const escapedArgs = args.map((a) => this.escapeValue(a, log, visited));
    const escapedBase = this.escapeValue(base, log, visited);
    const crossed = [
      ...entries.filter((e) => this.isPrimitiveProxy(e)),
      ...log.map((e) => e.wrapped),
    ];
    return { base: escapedBase, args: escapedArgs, log, crossed };
  }

  restore(log: EscapeRecord[]): void {
    for (const { container, prop, wrapped } of log) {
      const desc = Object.getOwnPropertyDescriptor(container, prop);
      if (
        desc !== undefined &&
        'value' in desc &&
        desc.writable === true &&
        Object.is(desc.value, this.unwrap(wrapped))
      ) {
        (container as Record<string | symbol, unknown>)[prop] = wrapped;
      }
    }
  }

  private escapeValue(
    v: unknown,
    log: EscapeRecord[],
    visited: Set<object>,
  ): unknown {
    if (this.isPrimitiveProxy(v)) return this.unwrap(v);
    if (this.containersMayHoldWrapped && typeof v === 'object' && v !== null) {
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
        (obj as Record<string | symbol, unknown>)[key] = this.unwrap(child);
        log.push({ container: obj, prop: key, wrapped: child });
      } else if (typeof child === 'object' && child !== null) {
        this.escapeInto(child, log, visited);
      }
    }
  }
}
