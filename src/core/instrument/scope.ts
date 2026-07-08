import { recursive, RecursiveVisitors } from 'acorn-walk';
import { VarKind } from '../utils.js';
import type * as acorn from 'acorn';
import { collectIdentifiers, collectRestIdentifiers } from './aux.js';

// -----------------------------------------------------------------------------
// scope
// -----------------------------------------------------------------------------
export class Scope {
  vars: { [name: string]: VarKind };
  spreadVars: Set<string>;
  tdzShadowedFuncNames: Set<string>;
  parent: Scope | null;
  private forLexical: boolean;

  constructor(parent: Scope | null, forLexical: boolean) {
    this.vars = {};
    this.spreadVars = new Set();
    this.tdzShadowedFuncNames = new Set();
    this.parent = parent;
    this.forLexical = forLexical;
  }

  isLexicalScope(): boolean {
    return this.forLexical;
  }

  walk(node: acorn.Node): void {
    if (!this.forLexical) recursive(node, this, Scope.visitors);
    recursive(node, this, Scope.lexicalVisitors);
  }

  walkArray(nodes: acorn.Node[]) {
    for (const node of nodes) {
      this.walk(node);
    }
  }

  walkFunction(node: acorn.Node, isExpr: boolean) {
    const func = node as acorn.Function;
    if (isExpr && func.id != null) {
      this.vars[func.id.name] = VarKind.Func;
    }
    if (func.type !== 'ArrowFunctionExpression') {
      this.vars['arguments'] = VarKind.Arguments;
    }
    for (const param of func.params) {
      const xs = collectIdentifiers(param);
      for (const x of xs) {
        this.vars[x] = VarKind.Param;
      }
      const spreadXs = collectRestIdentifiers(param);
      for (const x of spreadXs) {
        this.spreadVars.add(x);
      }
    }
    this.walk(func.body);
    if (func.id != null && func.body.type === 'BlockStatement') {
      const stmts = (func.body as any).body as any[];
      for (const stmt of stmts) {
        if (
          stmt.type === 'VariableDeclaration' &&
          (stmt.kind === 'let' || stmt.kind === 'const')
        ) {
          for (const decl of stmt.declarations) {
            for (const x of collectIdentifiers(decl.id as acorn.Pattern)) {
              if (x === func.id.name) {
                this.tdzShadowedFuncNames.add(x);
              }
            }
          }
        } else if (
          stmt.type === 'ClassDeclaration' &&
          stmt.id != null &&
          stmt.id.name === func.id.name
        ) {
          this.tdzShadowedFuncNames.add(stmt.id.name);
        }
      }
    }
  }

  walkCatch(node: acorn.Node) {
    const catchClause = node as acorn.CatchClause;
    const { param, body } = catchClause;
    if (param != null) {
      const xs = collectIdentifiers(param);
      for (const x of xs) {
        this.vars[x] = VarKind.CatchParam;
      }
      const spreadXs = collectRestIdentifiers(param);
      for (const x of spreadXs) {
        this.spreadVars.add(x);
      }
    }
  }

  static visitors: RecursiveVisitors<Scope> = {
    ImportDeclaration: (node, scope, c) => {
      for (const spec of (node as any).specifiers as any[]) {
        scope.vars[spec.local.name] = VarKind.Const;
      }
    },
    VariableDeclaration: (node, scope, c) => {
      const { kind, declarations } = node;
      if (kind === 'var') {
        for (const decl of declarations) {
          const xs = collectIdentifiers(decl.id);
          for (const x of xs) {
            scope.vars[x] = VarKind.Var;
          }
          const spreadXs = collectRestIdentifiers(decl.id);
          for (const x of spreadXs) {
            scope.spreadVars.add(x);
          }
        }
      }
    },
    FunctionDeclaration: (node, scope, c) => {
      const { id } = node;
      if (id != null) {
        scope.vars[id.name] = VarKind.Func;
      }
    },
    BlockStatement: (node, scope, c) => {
      for (const statement of node.body) {
        if (statement.type !== 'FunctionDeclaration') {
          c(statement, scope);
        }
      }
    },
    SwitchStatement: (node, scope, c) => {
      c(node.discriminant, scope);
      for (const switchCase of node.cases) {
        if (switchCase.test != null) {
          c(switchCase.test, scope);
        }
        for (const statement of switchCase.consequent) {
          if (statement.type !== 'FunctionDeclaration') {
            c(statement, scope);
          }
        }
      }
    },
    FunctionExpression: (node, scope, c) => {},
    ArrowFunctionExpression: (node, scope, c) => {},
    ClassDeclaration: (node, scope, c) => {
      const { id } = node;
      if (id != null) {
        scope.vars[id.name] = VarKind.Class;
      }
    },
    ClassExpression: (node, scope, c) => {},
  };

  static lexicalVisitors: RecursiveVisitors<Scope> = {
    ImportDeclaration: (node, scope, c) => {
      for (const spec of (node as any).specifiers as any[]) {
        scope.vars[spec.local.name] = VarKind.Const;
      }
    },
    VariableDeclaration: (node, scope, c) => {
      const { kind, declarations } = node;
      if (kind === 'let' || kind === 'const') {
        for (const decl of declarations) {
          const xs = collectIdentifiers(decl.id);
          for (const x of xs) {
            scope.vars[x] = kind === 'let' ? VarKind.Let : VarKind.Const;
          }
          const spreadXs = collectRestIdentifiers(decl.id);
          for (const x of spreadXs) {
            scope.spreadVars.add(x);
          }
        }
      }
    },
    BlockStatement: (node, scope, c) => {},
    ForStatement: (node, scope, c) => {},
    ForInStatement: (node, scope, c) => {},
    ForOfStatement: (node, scope, c) => {},
    SwitchStatement: (node, scope, c) => {},
    FunctionDeclaration: (node, scope, c) => {
      const { id } = node;
      if (id != null) {
        scope.vars[id.name] = VarKind.Func;
      }
    },
    FunctionExpression: (node, scope, c) => {},
    ArrowFunctionExpression: (node, scope, c) => {},
    ClassDeclaration: (node, scope, c) => {},
    ClassExpression: (node, scope, c) => {},
  };
}
