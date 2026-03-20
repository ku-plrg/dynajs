import { register } from "node:module";
import { pathToFileURL } from "node:url";
import path from "node:path";
import Module from 'module';
import { log, readFile } from "./utils.js";
import { setBaseObj } from './analysis.js';
import { instrumentFile } from "./instrument.js";
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

const targetRoot = path.resolve(process.cwd());

function isInstrumentTarget(filepath: string): boolean {
  const relative = path.relative(targetRoot, filepath);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function cjsLoader (module: any, filename: string) {
    if (verbose) log(`Loading (CJS) ${filename} with custom loader...`);
    let code : string;
    if (isInstrumentTarget(filename)) {
      code = instrumentFile(filename, { detail: false, isScript: false }); // TODO: options
    } else {
      code = readFile(filename);
    }
    module._compile(code, filename);
  };

function registerCJSloader(): void {
  const ModuleAny = Module as any;
  ModuleAny._extensions['.js'] = cjsLoader;
}

function main(): void {
  prepareGlobal();
  registerCJSloader();
  registerESMloader();
}
// set globalThis
// globalThis.b = 17;

main();
