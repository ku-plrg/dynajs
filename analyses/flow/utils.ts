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
