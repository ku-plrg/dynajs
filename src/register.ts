import type { LoadHook, ResolveHook } from "node:module";
import { instrument } from "./instrument.js";

function isInstrumentTarget(url: string): boolean {
  return url.startsWith('file://');
}

function instrumentSource(source: string, url: string): string {
  // TODO partial hooking
  return instrument(source, { detail: false });
}

export const resolve: ResolveHook = async (specifier, context, nextResolve) => {
  return nextResolve(specifier, context);
};

export const load: LoadHook = async (url, context, nextLoad) => {
  const result = await nextLoad(url, context);
  // TODO instrument
  console.log(`Loading module: ${url}`);
  if (isInstrumentTarget(url) && result.source) {
    result.source = instrumentSource(result.source.toString(), url);
  }
  return result;
};
