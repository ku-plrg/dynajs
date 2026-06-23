import { register } from 'node:module';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import Module from 'module';
import { getInstrumentedName, getStatName, log, writeFile } from '../utils.js';
import { setBaseObj } from '../analysis.js';
import { instrument } from '../instrument/main.js';
import { checkAnalysisHooks } from '../boot.js';
import type { CallbackHint } from '../partial.js';
import {
  getRuntimeOptions,
  printHelp,
  type RuntimeOptions,
} from './options.js';
import type { StateOption } from '../instrument/state.js';
import { registerVmHook } from './vm.js';
import { tryToRegisterWarningHook } from './warn.js';
import { isInstrumentTarget } from './include.js';
import { initializeIdGenerator } from '../instrument/write.js';

function prepareGlobal(options: RuntimeOptions): void {
  setBaseObj(options);
  if (options.analysis) {
    // NOTE this `require` is filled by `requireBanner` of `scripts/build-inject.mjs`.
    require(path.resolve(options.analysis));
    process.on('exit', () => D$.analysis?.endExecution?.());
  }
  // @ts-ignore - set globalThis.D$ to the analysis object
  global.print = function print(value) {
    console.log(value);
  };
  // @ts-ignore - set globalThis.assert to a simple assertion function
  global.assert = function assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  };
}

function registerESMloader(
  mode: CallbackHint | undefined,
  options: RuntimeOptions,
): void {
  const baseURL = options.home
    ? pathToFileURL(path.join(options.home, 'dist/entry/'))
    : new URL('./', import.meta.url); // should throw error instead
  register('./register.js', baseURL, { data: { mode, options } });
}

function writeInstrumentedFile(
  instrumentedPath: string,
  content: string,
): void {
  writeFile(instrumentedPath, content);
}

function registerCJSloader(
  mode: CallbackHint | undefined,
  options: Readonly<RuntimeOptions>,
): void {
  initializeIdGenerator(false);

  const previousCompile = (Module as any).prototype._compile;

  (Module as any).prototype._compile = function compileHook(
    code: string,
    filename: string,
  ) {
    if (!isInstrumentTarget(filename, options)) {
      if (options.verbose) log(`Skipping (CJS) ${filename}...`);
      return previousCompile.call(this, code, filename);
    }

    if (options.verbose)
      log(`Compiling (CJS) ${filename} with custom loader...`);

    const newPath = getInstrumentedName(filename);

    const instrumentOpt: StateOption = {
      ...options,
      isScript: true,
      callbackHint: mode,
      originalPath: filename,
      instrumentedPath: newPath,
    };

    const newCode = instrument(code, instrumentOpt);
    writeInstrumentedFile(newPath, newCode);
    return previousCompile.call(this, newCode, filename);
  };
}

function main(): void {
  const options = getRuntimeOptions();

  if (options.help) {
    printHelp();
    process.exit(0);
  }

  if (options.verbose) {
    log('Starting DynAJS with options:');
    log(JSON.stringify(options, null, 2));
  }

  prepareGlobal(options);
  const mode: CallbackHint | undefined = checkAnalysisHooks(
    !options.partialHook,
  );
  registerVmHook(mode, options);
  registerCJSloader(mode, options);
  registerESMloader(mode, options);
  tryToRegisterWarningHook();
}

main();
