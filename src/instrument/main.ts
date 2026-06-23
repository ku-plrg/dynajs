import {
  DYNAJS_VAR,
  EXCEPTION_VAR,
  TEMP_PARAM_VAR,
  NO_INSTRUMENT,
  PosMode,
  POS_MODE_DEFAULT,
} from '../constant.js';
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
import { beginLocCollection, getFileIdToLoc } from './write.js';
import { fixNamedEvaluations } from './fix-named-eval.js';

function mergeLocsToRuntime(fileLocs: {
  [id: number]: [number, number, number, number];
}): void {
  const runtime = (globalThis as any).D$;
  if (!runtime || typeof runtime !== 'object') return;
  if (!runtime.ids || typeof runtime.ids !== 'object') return;
  Object.assign(runtime.ids, fileLocs);
}

// ids are globally unique and contiguous per file (CJS counts up, ESM counts
// down — see initializeIdGenerator), so one `instrument()` call yields one
// closed id interval for `file`. Store it as a [lo, hi, file] interval rather
// than a string per id, and let the runtime resolve `id -> file` by lookup.
function idIntervalOf(fileLocs: {
  [id: number]: [number, number, number, number];
}): [number, number] | undefined {
  let lo = Infinity,
    hi = -Infinity;
  for (const key of Object.keys(fileLocs)) {
    const id = Number(key);
    if (id < lo) lo = id;
    if (id > hi) hi = id;
  }
  return hi < lo ? undefined : [lo, hi];
}

function mergeFileToRuntime(lo: number, hi: number, file: string): void {
  const runtime = (globalThis as any).D$;
  if (!runtime || typeof runtime !== 'object') return;
  if (!Array.isArray(runtime.files)) return;
  runtime.files.push([lo, hi, file]);
}

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

export function instrument(code: string, options: StateOption): string {
  if (options.verbose) header('Instrumenting the code...');
  const locMode: PosMode = options.pos ?? POS_MODE_DEFAULT;
  beginLocCollection(locMode);
  const ast = parse(code, options.isScript);
  const state = new State(options);
  if (options.verbose) log(stringify(ast));

  let output = code;

  if (code.indexOf(NO_INSTRUMENT) == -1) {
    fixNamedEvaluations(ast);
    state.walk(ast);
    output = `// INSTRUMENTED BY DYNAJS
${state.output}`;
  }
  const fileIdToLoc = getFileIdToLoc();
  // `originalPath` is the real file for instrumentFile, and the eval mode label
  // ('eval'/'evalIndirect') for on-the-fly instrumentation. Either is a usable
  // site label; fall back to 'unknown' only if neither was set.
  const file = options.originalPath ?? 'unknown';
  const interval = idIntervalOf(fileIdToLoc);
  if (locMode === PosMode.MEMORY) {
    mergeLocsToRuntime(fileIdToLoc);
    if (interval) mergeFileToRuntime(interval[0], interval[1], file);
  }

  const prefixLines = [NO_INSTRUMENT];
  if (locMode === PosMode.PERSIST) {
    prefixLines.push(
      `${DYNAJS_VAR}.ids = Object.assign(${DYNAJS_VAR}.ids, ${JSON.stringify(fileIdToLoc)});`,
    );
    if (interval)
      prefixLines.push(
        `${DYNAJS_VAR}.files.push([${interval[0]}, ${interval[1]}, ${JSON.stringify(file)}]);`,
      );
  }
  output = `${prefixLines.join('\n')}
${output}`;

  if (options.verbose) log(output.trim());
  return output;
}
