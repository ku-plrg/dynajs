import type { LoadHook, ResolveHook } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { instrumentFile } from "./instrument.js";
import { DYNAJS_VERBOSE as verbose } from "./constants/general.js";
import { log } from "./utils.js";

const targetRoot = path.resolve(process.cwd());

function getFilePathFromUrl(url: string): string | null {
  if (!url.startsWith('file://')) {
    return null;
  }

  const parsed = new URL(url);
  parsed.search = '';
  parsed.hash = '';
  return fileURLToPath(parsed);
}

function isInstrumentTarget(url: string): boolean {
  const filename = getFilePathFromUrl(url);
  if (filename === null) {
    return false;
  }

  const relative = path.relative(targetRoot, filename);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function instrumentSource(source: string, url: string): string {
  const filename = getFilePathFromUrl(url) ?? url;
  const str = instrumentFile(filename, { detail: false, isScript: false }); // TODO options
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
