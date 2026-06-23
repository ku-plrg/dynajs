import type { InitializeHook, LoadHook, ResolveHook } from 'node:module';
import type { CallbackHint } from '../partial.js';
import { instrument } from '../instrument/main.js';
import { getInstrumentedName, getStatName, log, writeFile } from '../utils.js';
import type { RuntimeOptions } from './options.js';
import {
  getFilePathFromUrl,
  isInstrumentTarget as isInstrumentTargetPath,
} from './include.js';
import { initializeIdGenerator } from '../instrument/write.js';

let mode: CallbackHint | undefined;
let options: RuntimeOptions;

function isInstrumentTarget(url: string): boolean {
  const filename = getFilePathFromUrl(url);
  if (filename === null) {
    return false;
  }
  return isInstrumentTargetPath(filename, options);
}

function writeInstrumentedFile(
  instrumentedPath: string,
  content: string,
): void {
  writeFile(instrumentedPath, content);
}

function instrumentSource(source: string, url: string): string {
  const filename = getFilePathFromUrl(url) ?? url;
  const instrumentedPath = getInstrumentedName(filename);
  const instrumentedSource = instrument(source, {
    verbose: options.verbose,
    pos: options.pos,
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
  initializeIdGenerator(true);
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
