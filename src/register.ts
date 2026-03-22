import type { InitializeHook, LoadHook, ResolveHook } from "node:module";
import type { FeatureTagCheck } from "./types.js";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { instrument } from "./instrument.js";
import { DYNAJS_IGNORE_NODE_MODULES, DYNAJS_VERBOSE as verbose } from "./constants/general.js";
import { getInstrumentedName, log, writeFile } from "./utils.js";

let mode: FeatureTagCheck | undefined;
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

  // is .includes good enough?
  if (DYNAJS_IGNORE_NODE_MODULES && relative.includes('node_modules')) {
    return false;
  }

  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function writeInstrumentedFile(instrumentedPath: string, content: string): void {
  writeFile(instrumentedPath, content);
}

function instrumentSource(source: string, url: string): string {
  const filename = getFilePathFromUrl(url) ?? url;
  const instrumentedPath = getInstrumentedName(filename);
  const instrumentedSource = instrument(source, {
    detail: false,
    isScript: false,
    isEnabled: mode,
    originalPath: filename,
    instrumentedPath,
  });
  writeInstrumentedFile(instrumentedPath, instrumentedSource);
  return instrumentedSource;
}

export const initialize: InitializeHook = async ({ mode: initialMode }) => {
  mode = initialMode;
};

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
