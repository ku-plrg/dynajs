// The DynaJS runtime injects `D$` as a global before loading an analysis file
// (see src/entry/import.ts). `src/analysis.ts` declares its type in global
// scope; importing that type here brings the declaration into the samples
// program so `@ts-check`'d sample files can reference `D$`.
import type { DynaJSType } from '../src/analysis.js';

declare global {
  var D$: DynaJSType;
}
