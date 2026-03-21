export const DYNAJS_VAR = 'D$';
export const EXCEPTION_VAR = DYNAJS_VAR + 'e';
export const TEMP_PARAM_VAR = DYNAJS_VAR + 'x';
export const SCRIPT_NAME = 'dynajs';
export const NO_INSTRUMENT = '// DYNAJS DO NOT INSTRUMENT';
export const EXIT_CODE_TODO = 70;

function checkEnvVar(name: string): boolean {
  const value = process.env[name];
  if (value === undefined) return false;
  switch (value.toLowerCase()) {
    case '1':
    case 'true':
      return true;
    case '0':
    case 'false':
      return false;
  }
  return true;
}

// this options are used for `dynajs`, not `dynajs-legacy`.
export const DYNAJS_VERBOSE = checkEnvVar('DYNAJS_VERBOSE');
export const DYNAJS_PARTIAL_HOOK = checkEnvVar('DYNAJS_PARTIAL_HOOK');