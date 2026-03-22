import { register } from "node:module";
import { pathToFileURL } from "node:url";
import path from "node:path";
import Module from 'module';
import { getInstrumentedName, log, writeFile } from "./utils.js";
import { setBaseObj } from './analysis.js';
import { instrument } from "./instrument.js";
import { DYNAJS_IGNORE_NODE_MODULES, DYNAJS_PARTIAL_HOOK, DYNAJS_VERBOSE as verbose } from "./constants/general.js";
import { checkAnalysisHooks } from "./boot.js";
import { FeatureTagCheck } from "./types.js";

function prepareGlobal(): void {
  setBaseObj();
  const DYNAJS_ANALYSIS = process.env.DYNAJS_ANALYSIS;
  if (DYNAJS_ANALYSIS) {
    // NOTE this `require` is filled by `requireBanner` of `scripts/build-inject.mjs`.
    require(path.resolve(DYNAJS_ANALYSIS));
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

function registerESMloader(mode : FeatureTagCheck | undefined): void {
  const baseURL = process.env.DYNAJS_HOME
    ? pathToFileURL(path.join(process.env.DYNAJS_HOME, "dist/"))
    : new URL("./", import.meta.url);
  register("./register.js", baseURL, { data: { mode }});
}

const targetRoot = path.resolve(process.cwd());

function isInstrumentTarget(filepath: string): boolean {
  const relative = path.relative(targetRoot, filepath);
  // is .includes good enough?
  if (DYNAJS_IGNORE_NODE_MODULES && relative.includes('node_modules')) {
    return false;
  }
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function writeInstrumentedFile(instrumentedPath: string, content: string): void {
  writeFile(instrumentedPath, content);
}

function registerCJSloader(mode : FeatureTagCheck | undefined): void {
  const previousCompile = (Module as any).prototype._compile;

  (Module as any).prototype._compile = function compileHook(code: string, filename: string) {
    if (verbose) log(`Compiling (CJS) ${filename} with custom loader...`);

    if (!isInstrumentTarget(filename)) {
      return previousCompile.call(this, code, filename);
    }

    const instrumentedPath = getInstrumentedName(filename);
    const instrumentedCode = instrument(code, {
      detail: false,
      isScript: false,
      isEnabled: mode,
      originalPath: filename,
      instrumentedPath,
    });
    writeInstrumentedFile(instrumentedPath, instrumentedCode);
    return previousCompile.call(this, instrumentedCode, filename);
  };
}

function main(): void {
  prepareGlobal();
  const mode : FeatureTagCheck | undefined = checkAnalysisHooks(!DYNAJS_PARTIAL_HOOK);
  registerCJSloader(mode);
  registerESMloader(mode);
}

main();
