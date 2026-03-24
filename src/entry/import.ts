import { register } from "node:module";
import { pathToFileURL } from "node:url";
import path from "node:path";
import Module from 'module';
import { getInstrumentedName, getStatName, log, writeFile } from "../utils.js";
import { setBaseObj } from '../analysis.js';
import { instrument } from "../instrument/main.js";
import { checkAnalysisHooks } from "../boot.js";
import { FeatureTagCheck } from "../types.js";
import { recordStat, writeStatFile } from "../statistics.js";
import { getRuntimeOptions, printHelp, RuntimeOptions } from "./options.js";

function prepareGlobal(options: RuntimeOptions): void {
  setBaseObj();
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
      throw new Error(message || "Assertion failed");
    }
  };
}

function registerESMloader(mode : FeatureTagCheck | undefined, options: RuntimeOptions): void {
  const baseURL = options.home
    ? pathToFileURL(path.join(options.home, "dist/entry/"))
    : new URL("./", import.meta.url); // should throw error instead
  register("./register.js", baseURL, { data: { mode, options } });
}

const targetRoot = path.resolve(process.cwd());

function isInstrumentTarget(filepath: string, options: RuntimeOptions): boolean {
  const relative = path.relative(targetRoot, filepath);
  // is .includes good enough?
  if (options.ignoreNodeModules && relative.includes('node_modules')) {
    return false;
  }
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function writeInstrumentedFile(instrumentedPath: string, content: string): void {
  writeFile(instrumentedPath, content);
}

function writeStatisticsFile(statPath: string, code: string): void {
  writeStatFile(statPath, recordStat(code));
}

function registerCJSloader(mode : FeatureTagCheck | undefined, options: RuntimeOptions): void {
  const previousCompile = (Module as any).prototype._compile;

  (Module as any).prototype._compile = function compileHook(code: string, filename: string) {

    if (!isInstrumentTarget(filename, options)) {
      if (options.verbose) log(`Skipping (CJS) ${filename}...`);
      return previousCompile.call(this, code, filename);
    }
    
    if (options.verbose) log(`Compiling (CJS) ${filename} with custom loader...`);

    const instrumentedPath = getInstrumentedName(filename);

    if (options.stat) {
      const statPath = getStatName(filename);
      writeStatisticsFile(statPath, code);
    }

    const instrumentedCode = instrument(code, {
      ...options,
      isScript: true, // ???
      isEnabled: mode,
      originalPath: filename,
      instrumentedPath,
    });
    writeInstrumentedFile(instrumentedPath, instrumentedCode);
    return previousCompile.call(this, instrumentedCode, filename);
  };
}

function main(): void {
  const options = getRuntimeOptions();

  if (options.help) {
    printHelp();
    process.exit(0);
  }

  if (options.verbose) {
    log("Starting DynAJS with options:");
    log(JSON.stringify(options, null, 2));
  }

  prepareGlobal(options);
  const mode : FeatureTagCheck | undefined = checkAnalysisHooks(!options.partialHook);
  registerCJSloader(mode, options);
  registerESMloader(mode, options);
}

main();
