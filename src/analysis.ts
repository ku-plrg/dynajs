import {
  log,
  stringify,
} from './utils';
import * as utils from './utils';

// -----------------------------------------------------------------------------
// analysis templates
// -----------------------------------------------------------------------------
type Analysis = {
  literal?: (id: number, value: any, type: number) => void;
  endExpression?: (id: number, value: any) => void;
  scriptEnter?: (id: number, instrumentedPath: string, originalPath: string) => void;
  scriptExit?: (id: number) => void;
  endExecution?: () => void;
  uncaughtException?: any;
  result?: any;
}

// -----------------------------------------------------------------------------
// hooks for dynamic analysis
// -----------------------------------------------------------------------------
// hook for the end of an expression
function E(id: number, value: any): any {
  D$.analysis.endExpression?.(id, value);
  return value;
}

// hook for literals
function L(id: number, value: any, type: number): any {
  D$.analysis.literal?.(id, value, type);
  return value;
}

// hook for uncaught exceptions
function X(id: number, exception: any): void {
  D$.analysis.uncaughtException = { exception };
}

// hook for script entry
function Se(id: number, instrumentedPath: string, originalPath: string): void {
  D$.analysis.scriptEnter?.(id, instrumentedPath, originalPath);
}

// hook for script exit
function Sx(id: number): void {
  const exc = D$.analysis.uncaughtException;
  D$.analysis.scriptExit?.(id);
  if (exc) {
    const tmp = exc.exception;
    D$.analysis.uncaughtException = undefined;
    throw tmp;
  }
}

// get the location string from an id
function idToLoc(id: number) {
  var [ startRow, startCol, endRow, endCol ] = D$.ids[id];
  return startRow == endRow
    ? `${startRow}:${startCol}-${endCol}`
    : `${startRow}:${startCol}-${endRow}:${endCol}`;
};

// -----------------------------------------------------------------------------
// assign to the global D$ variable
// -----------------------------------------------------------------------------
const BASE = { analysis: {}, ids: {}, idToLoc, utils, E, L, Se, Sx };
type DynaJSType = typeof BASE & {
  analysis: Analysis;
  idToLoc: (id: number) => string;
  ids: Record<string, [number, number, number, number]>;
}

declare global { var D$: DynaJSType; };
globalThis.D$ = BASE;
