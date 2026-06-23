export const DYNAJS_VAR = 'D$';
export const EXCEPTION_VAR = DYNAJS_VAR + 'e';
export const TEMP_PARAM_VAR = DYNAJS_VAR + 'x';
export const SCRIPT_NAME = 'dynajs';
export const NO_INSTRUMENT = '// DYNAJS DO NOT INSTRUMENT';
export const INSTRUMENTED_MARK = '/* DYNAJS-INSTRUMENTED-BODY */';
export const EXIT_CODE_TODO = 70;
export const ECMA_VERSION = 2025 as const;

export enum PosMode {
  PERSIST = 'persist',
  MEMORY = 'memory',
  OFF = 'off',
}

export const POS_MODE_DEFAULT = PosMode.MEMORY;
