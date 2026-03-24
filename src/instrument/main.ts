import {
  DYNAJS_VAR,
  EXCEPTION_VAR,
  TEMP_PARAM_VAR,
  NO_INSTRUMENT,
} from '../constants/general.js';
import {
  getInstrumentedName,
  header,
  log,
  parse,
  readFile,
  stringify,
  writeFile,
} from '../utils.js';

import { State, type StateOption } from './state.js';
// TODO : move this to return value, instead of shared mutable state
import { idToLoc } from './log.js';

// instrument a JS file
export function instrumentFile(filename: string, options: StateOption): string {
  const code = readFile(filename);
  const { verbose } = options;
  options.originalPath = filename;
  if (verbose) log(`The instrumentation target file is \`${filename}\`.`);

  const outputPath = getInstrumentedName(filename);
  options.instrumentedPath = outputPath;
  if (verbose) log('Instrumentation completed.');

  const instrumentedCode = instrument(code, options);
  writeFile(outputPath, instrumentedCode);
  if (verbose) log(`Instrumented file written to \`${outputPath}\`.`);

  return instrumentedCode;
}

// return the instrumented code
export function instrument(code: string, options: StateOption): string {
  if (options.verbose) header('Instrumenting the code...');
  const ast = parse(code, options.isScript);
  const state = new State(options);
  if (options.verbose) log(stringify(ast));

  let output = code

  if (code.indexOf(NO_INSTRUMENT) == -1) {
    state.walk(ast);
    output = `// INSTRUMENTED BY DYNAJS
${state.output}`;
  }
  output = `${NO_INSTRUMENT}
${DYNAJS_VAR}.ids = ${JSON.stringify(idToLoc)};
${output}`;

  if (options.verbose) log(output.trim());
  return output;
}

