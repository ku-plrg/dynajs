import type { LoadHook, ResolveHook } from "node:module";
import { instrument, instrumentFile } from "./instrument.js";
import { DYNAJS_VERBOSE as verbose } from "./constants/general.js";
import { log } from "./utils.js";

function isInstrumentTarget(url: string): boolean {
  return url.startsWith('file://');
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
  if (verbose) log(`Loading ${url} with custom loader...`);
  if (isInstrumentTarget(url) && result.source) {
    result.source = instrumentSource(result.source.toString(), url);
  }
  return result;
};
