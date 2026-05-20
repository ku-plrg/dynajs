// Taint state + the actual host-callable helpers.
//
// The analysis cannot see which *variable* an argument refers to — it only
// sees the value. So the read-hook in index.ts stashes the name of the most
// recent identifier read into `lastReadName`, and the helpers below consult it.
//
// Without the analysis attached, the read/write hooks never fire, `lastReadName`
// stays undefined, and `__is_tainted__` returns false. The helpers are still
// callable so non-instrumented runs don't crash with ReferenceError.

const taintedNames = new Set<string>();
let lastReadName: string | undefined;

export function __set_taint__(_value: unknown): void {
  if (lastReadName !== undefined) taintedNames.add(lastReadName);
}

export function __is_tainted__(_value: unknown): boolean {
  return lastReadName !== undefined && taintedNames.has(lastReadName);
}

export const taintState = {
  noteRead(name: string): void {
    lastReadName = name;
  },
  noteWrite(names: readonly string[]): void {
    for (const n of names) taintedNames.delete(n);
  },
  snapshot(): string[] {
    return Array.from(taintedNames);
  },
};

export function installPrelude(): void {
  const g = globalThis as Record<string, unknown>;
  g.__set_taint__ = __set_taint__;
  g.__is_tainted__ = __is_tainted__;
}
