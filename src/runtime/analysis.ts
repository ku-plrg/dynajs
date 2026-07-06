import { INSTRUMENTED_MARK } from '../constant.js';
import type { RuntimeOptions } from '../entry/options.js';
import * as hooks from './hooks.js';
import { chainSkip } from './runtime.js';
import { instrument } from '../instrument/main.js';
import type { StateOption } from '../instrument/state.js';
import type { AnalysisCallback } from '../types/analysis.js';
import * as utils from '../utils.js';
import { CAPTURED, locToStr } from '../utils.js';

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
  analysis: {} as AnalysisCallback,
  ids: {} as Record<string, [number, number, number, number]>,
  files: [] as Array<[number, number, string]>,
  idToLoc,
  idToFile,
  utils,
  chainSkip,
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
