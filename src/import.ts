import { register } from "node:module";
import { pathToFileURL } from "node:url";
import path from "node:path";
import Module from 'module';
import { log, readFile } from "./utils.js";
import { setBaseObj } from './analysis.js';
import { instrument } from "./instrument.js";
import { DYNAJS_VERBOSE as verbose } from "./constants/general.js";

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

function registerESMloader(): void {
  const baseURL = process.env.DYNAJS_HOME
    ? pathToFileURL(path.join(process.env.DYNAJS_HOME, "dist/"))
    : new URL("./", import.meta.url);
  register("./register.js", baseURL);
}

function registerCJSloader(): void {
  const ModuleAny = Module as any;
  ModuleAny._extensions['.js'] = function (module: any, filename: string) {
    const code = readFile(filename);
    if (verbose) log(`Loading ${filename} with custom loader...`);
    const instrumentedCode = instrument(code, { detail: false, isScript: false }); // TODO: options
    module._compile(instrumentedCode, filename);
  };
}

function main(): void {
  prepareGlobal();
  registerCJSloader();
  registerESMloader();
}
// set globalThis
// globalThis.b = 17;

main();
