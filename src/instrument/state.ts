import { recursive } from 'acorn-walk';
import { FEATURE_CHECK_ALL_TRUE, FeatureTagCheck } from '../partial.js';
import { Scope } from './scope.js';
import { visitors } from './visitor.js';
import type * as acorn from 'acorn';

// -----------------------------------------------------------------------------
// states for walking the AST
// -----------------------------------------------------------------------------

// state options
export interface StateOption {
  write?: (str: string) => void
  indent?: string
  lineEnd?: string
  instrumentedPath?: string
  originalPath?: string
  verbose?: boolean
  isEnabled?: FeatureTagCheck
  isScript: boolean
}


export class State {
  output: string;
  write: (str: string) => void;
  indent: string;
  indentLevel: number;
  lineEnd: string;
  scope: Scope | null;
  isLHS: boolean;
  instrumentedPath: string;
  originalPath: string;
  verbose: boolean;
  isEnabled: FeatureTagCheck;
  inDerivedClass: boolean;
  isDerivedConstructor: boolean;
  isStrict: boolean;

  constructor(options: StateOption) {
    this.output = '';
    if (options.write != null) {
      this.write = options.write;
    } else {
      this.write = (str: string) => { this.output += str };
    }
    this.indent = options.indent ?? '  ';
    this.indentLevel = 0;
    this.lineEnd = options.lineEnd ?? '\n';
    this.scope = null;
    this.isLHS = false;
    this.instrumentedPath = options.instrumentedPath ?? '';
    this.originalPath = options.originalPath ?? '';
    this.verbose = options.verbose ?? false;
    this.isEnabled = Object.freeze(options.isEnabled ?? { ...FEATURE_CHECK_ALL_TRUE });
    this.inDerivedClass = false;
    this.isDerivedConstructor = false;
    // non-strict by default for scripts, strict by default for modules
    this.isStrict = options.isScript ? false : true;
  }

  // execute body with isLHS = true
  withLHS<T>(body: () => T): T {
    const prev = this.isLHS;
    this.isLHS = true;
    const result = body();
    this.isLHS = prev;
    return result;
  }

  // create and enter a new scope
  createScope(body: (scope: Scope) => void, forLexical: boolean = false): Scope {
    const scope = new Scope(this.scope, forLexical);
    body(scope);
    this.scope = scope;
    return scope;
  }

  // execute body within a fresh scope and restore the previous scope afterwards
  withScope<T>(
    collect: (scope: Scope) => void,
    body: () => T,
    forLexical: boolean = false,
  ): T {
    const prev = this.scope;
    this.createScope(collect, forLexical);
    try {
      return body();
    } finally {
      this.scope = prev;
    }
  }

  withStrictMode<T>(strict: boolean, body: () => T): T {
    const prev = this.isStrict;
    this.isStrict = strict;
    try {
      return body();
    } finally {
      this.isStrict = prev;
    }
  }

  // wrap
  wrap(body: () => void): void {
    this.indentLevel++;
    body();
    this.indentLevel--;
  }

  // write with newline
  writeln(str: string): void {
    this.write(this.lineEnd);
    this.write(this.indent.repeat(this.indentLevel));
    this.write(str);
  }

  // walk the AST nodes recursively
  walk(node: acorn.Node): void {
    recursive(node, this, visitors);
  }

  // walk the AST nodes in an array recursively with newline
  walkln(node: acorn.Node): void {
    this.write(this.lineEnd);
    this.write(this.indent.repeat(this.indentLevel));
    this.walk(node);
  }

  // walk the AST nodes in an array recursively
  walkArray(
    nodes: acorn.Node[],
    sep: string = ', ',
  ): void {
    const length = nodes.length;
    if (length === 0) return;
    this.walk(nodes[0]);
    for (let i = 1; i < length; i++) {
      this.write(sep);
      this.walk(nodes[i]);
    }
  }
}
