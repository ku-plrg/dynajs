import type { LoadHook, ResolveHook } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { instrumentFile } from "./instrument.js";
import { DYNAJS_VERBOSE as verbose } from "./constants/general.js";
import { log } from "./utils.js";

const targetRoot = path.resolve(process.cwd());

function isInstrumentTarget(url: string): boolean {
  if (!url.startsWith('file://')) {
    return false;
  }

  const filename = fileURLToPath(url);
  const relative = path.relative(targetRoot, filename);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function instrumentSource(source: string, url: string): string {
  // TODO partial hooking
  const stripped = url.startsWith('file://') ? url.slice('file://'.length) : url;
  const str = instrumentFile(stripped, { detail: false, isScript: false }); // TODO options
  return str;
}

export const resolve: ResolveHook = async (specifier, context, nextResolve) => {
  return nextResolve(specifier, context);
};

export const load: LoadHook = async (url, context, nextLoad) => {
  const result = await nextLoad(url, context);
  if (verbose) log(`Loading (ESM) ${url} with custom loader...`);
  if (isInstrumentTarget(url) && result.source) {
    result.source = instrumentSource(result.source.toString(), url);
  }
  return result;
};
