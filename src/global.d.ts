import type { DynaJSType } from './index.js';

declare namespace global {
  // `var` (not `const`/`let`) is required so `globalThis.D$ = …` type-checks —
  // only var/function globals become properties of `typeof globalThis`.
  var D$: DynaJSType;
}
