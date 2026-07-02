import { INSTRUMENTED_MARK } from '../constant.js';
import type { RuntimeOptions } from '../entry/options.js';
import * as hooks from './hooks.js';
import { chainSkip } from './runtime.js';
import { instrument } from '../instrument/main.js';
import type { StateOption } from '../instrument/state.js';
import type { Analysis } from '../types/analysis.js';
import * as utils from '../utils.js';
import { CAPTURED, locToStr } from '../utils.js';

// -----------------------------------------------------------------------------
// instrumented-function detection
// -----------------------------------------------------------------------------
// The instrumenter stamps INSTRUMENTED_MARK into every function body it emits
// (logFuncTail always writes a block body, so every function syntax funnels
// through one stamp; bodiless classes carry it in the class body), and
// Function.prototype.toString preserves source text verbatim. So a function's
// text answers the actual question — "does this code call D$ hooks?" — for
// every creation form (declarations, expressions, methods, accessors, class
// fields), with no per-syntax registration sites and no hoisting window.
// `isInstrumented` is the "controlled code" predicate: it separates
// hook-bearing functions from natives AND from uninstrumented JS (files
// outside the include roots), whose toString() looks like ordinary source —
// a native-code check cannot tell those apart. Bound functions and callable
// proxies report "[native code]" and correctly fall out as uncontrolled.
const instrumentedCache = new WeakMap<Function, boolean>();

function isInstrumented(f: unknown): boolean {
  if (typeof f !== 'function') return false;
  let cached = instrumentedCache.get(f);
  if (cached === undefined) {
    let src = '';
    // pristine toString: user code may override Function.prototype.toString;
    // exotic callables (revoked proxies) may throw — treat as uncontrolled
    try {
      src = CAPTURED.FunctionToString.call(f);
    } catch {
      /* uncontrolled */
    }
    cached = src.includes(INSTRUMENTED_MARK);
    instrumentedCache.set(f, cached);
  }
  return cached;
}

// get the location string from an id
function idToLoc(id: number): string {
  return locToStr(D$.ids[id]);
}

// get the originating file for an id. `D$.files` holds one [lo, hi, file]
// interval per instrumented file (ids are globally unique and contiguous per
// file); intervals are disjoint, so the first containing interval is the file.
function idToFile(id: number): string | undefined {
  for (const [lo, hi, file] of D$.files) {
    if (id >= lo && id <= hi) return file;
  }
  return undefined;
}

// -----------------------------------------------------------------------------
// assign to the global D$ variable
// -----------------------------------------------------------------------------
const BASE = {
  analysis: {} as Analysis,
  ids: {} as Record<string, [number, number, number, number]>,
  files: [] as Array<[number, number, string]>,
  idToLoc,
  idToFile,
  utils,
  chainSkip,
  isInstrumented,
  ...hooks,
};
type GENERATED = {
  // on-the-fly instrumentation API
  instrument: (code: string, filename: string | undefined) => string;
};
export type DynaJSType = typeof BASE & GENERATED;

export function setBaseObj(runtimeOpts: RuntimeOptions) {
  const generated = {
    instrument: (code: string, filename: string | undefined) => {
      const instrumentOpt: StateOption = {
        ...runtimeOpts,
        isScript: false, // treat as module code for now - see issue #5
        callbackHint: undefined, // TODO mode,
        originalPath: filename,
        instrumentedPath: undefined, // TODO newPath,
      };

      return instrument(code, instrumentOpt);
    },
  };
  const dynaJSType = { ...BASE, ...generated } as DynaJSType;
  globalThis.D$ = dynaJSType;
}
