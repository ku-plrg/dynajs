import type { InitializeHook, LoadHook, ResolveHook } from "node:module";
import type { CallbackHint } from "../partial.js";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { instrument } from "../instrument/main.js";
import { getInstrumentedName, getStatName, log, writeFile } from "../utils.js";
import { recordStat, writeStatFile } from "../statistics.js";
import type { RuntimeOptions } from "./options.js";

let mode: CallbackHint | undefined;
let options: RuntimeOptions;
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
  if (options.ignoreNodeModules && relative.includes('node_modules')) {
    return false;
  }

  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function writeInstrumentedFile(instrumentedPath: string, content: string): void {
  writeFile(instrumentedPath, content);
}

function writeStatisticsFile(statPath: string, source: string): void {
  writeStatFile(statPath, recordStat(source));
}

function instrumentSource(source: string, url: string): string {
  const filename = getFilePathFromUrl(url) ?? url;
  const instrumentedPath = getInstrumentedName(filename);
  if (options.stat) {
    const statPath = getStatName(filename);
    writeStatisticsFile(statPath, source);
  }
  const instrumentedSource = instrument(source, {
    verbose: options.verbose,
    isScript: false,
    callbackHint: mode,
    originalPath: filename,
    instrumentedPath,
  });
  writeInstrumentedFile(instrumentedPath, instrumentedSource);
  return instrumentedSource;
}

export const initialize: InitializeHook = async (data) => {
  mode = data.mode;
  options = data.options;
};

export const resolve: ResolveHook = async (specifier, context, nextResolve) => {
  return nextResolve(specifier, context);
};

export const load: LoadHook = async (url, context, nextLoad) => {
  const result = await nextLoad(url, context);
  if (isInstrumentTarget(url) && result.source) {
    if (options.verbose) log(`Loading (ESM) ${url} with custom loader...`);
    result.source = instrumentSource(result.source.toString(), url);
  } else {
    if (options.verbose) log(`Skipping (ESM) ${url}...`);
  }
  return result;
};
