export const DYNAJS_VAR = 'D$';
export const EXCEPTION_VAR = DYNAJS_VAR + 'e';
export const TEMP_PARAM_VAR = DYNAJS_VAR + 'x';
export const SCRIPT_NAME = 'dynajs';
export const NO_INSTRUMENT = '// DYNAJS DO NOT INSTRUMENT';
export const INSTRUMENTED_MARK = '/* DYNAJS-INSTRUMENTED-BODY */';
export const EXIT_CODE_TODO = 70;
export const ECMA_VERSION = 2025 as const;

// Whether to collect source positions (id -> [line, col, line, col]) and
// persist them into the instrumented output so `D$.idToLoc`/`D$.idToFile` can
// map ids back to source. Persisting into the file (rather than merging into an
// in-process map) is the only correct option once the loader and executed code
// may live in different threads (ESM) or processes.
export const POS_DEFAULT = true;
