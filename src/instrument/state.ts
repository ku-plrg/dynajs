import { recursive } from 'acorn-walk';
import { Scope } from './scope.js';
import { visitors } from './visitor.js';
import { PartialChecker, type CallbackHint } from '../partial.js';
import type * as acorn from 'acorn';
import type { PosMode } from '../constant.js';

// -----------------------------------------------------------------------------
// states for walking the AST
// -----------------------------------------------------------------------------

export interface StateOption {
  write?: (str: string) => void;
  indent?: string;
  lineEnd?: string;
  instrumentedPath?: string;
  originalPath?: string;
  verbose?: boolean;
  pos: PosMode;
  callbackHint: CallbackHint | undefined;
  isScript: boolean;
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
  partial: PartialChecker;
  inDerivedClass: boolean;
  isDerivedConstructor: boolean;
  isStrict: boolean;

  constructor(options: StateOption) {
    this.output = '';
    if (options.write != null) {
      this.write = options.write;
    } else {
      this.write = (str: string) => {
        this.output += str;
      };
    }
    this.indent = options.indent ?? '  ';
    this.indentLevel = 0;
    this.lineEnd = options.lineEnd ?? '\n';
    this.scope = null;
    this.isLHS = false;
    this.instrumentedPath = options.instrumentedPath ?? '';
    this.originalPath = options.originalPath ?? '';
    this.verbose = options.verbose ?? false;
    this.partial = new PartialChecker(options.callbackHint);
    this.inDerivedClass = false;
    this.isDerivedConstructor = false;
    // non-strict by default for scripts, strict by default for modules
    this.isStrict = options.isScript ? false : true;
  }

  withLHS<T>(body: () => T): T {
    const prev = this.isLHS;
    this.isLHS = true;
    const result = body();
    this.isLHS = prev;
    return result;
  }

  createScope(
    body: (scope: Scope) => void,
    forLexical: boolean = false,
  ): Scope {
    const scope = new Scope(this.scope, forLexical);
    body(scope);
    this.scope = scope;
    return scope;
  }

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

  wrap(body: () => void): void {
    this.indentLevel++;
    body();
    this.indentLevel--;
  }

  writeln(str: string): void {
    this.write(this.lineEnd);
    this.write(this.indent.repeat(this.indentLevel));
    this.write(str);
  }

  walk(node: acorn.Node): void {
    recursive(node, this, visitors);
  }

  walkln(node: acorn.Node): void {
    this.write(this.lineEnd);
    this.write(this.indent.repeat(this.indentLevel));
    this.walk(node);
  }

  walkArray(nodes: acorn.Node[], sep: string = ', '): void {
    const length = nodes.length;
    if (length === 0) return;
    this.walk(nodes[0]);
    for (let i = 1; i < length; i++) {
      this.write(sep);
      this.walk(nodes[i]);
    }
  }
}
