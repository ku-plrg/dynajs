import {
  DYNAJS_VAR,
  EXCEPTION_VAR,
  TEMP_PARAM_VAR,
  NO_INSTRUMENT,
} from './constants/general.js';
import type {
  AnyNode,
  BinaryExpression,
  CatchClause,
  Class,
  Expression,
  ForInStatement,
  ForOfStatement,
  Function,
  Identifier,
  LogicalExpression,
  MemberExpression,
  Node,
  Pattern,
  ReturnStatement,
  UnaryExpression,
  UpdateExpression,
} from 'acorn';
import { recursive, RecursiveVisitors } from 'acorn-walk'
import { generate } from 'astring';
import {
  VarKind,
  getInstrumentedName,
  getLocFromNode,
  header,
  kindToStr,
  locToStr,
  log,
  parse,
  readFile,
  strToKind,
  stringify,
  todo,
  warn,
  writeFile,
} from './utils.js';
import { FEATURE_CHECK_ALL_TRUE, type FeatureTagCheck } from './types.js';
import * as LOG from './constants/hook.js';

// instrument a JS file
export function instrumentFile(filename: string, options: Options = {}): string {
  const code = readFile(filename);
  const { detail } = options;
  options.originalPath = filename;
  if (detail) log(`The instrumentation target file is \`${filename}\`.`);

  const outputPath = getInstrumentedName(filename);
  options.instrumentedPath = outputPath;
  if (detail) log('Instrumentation completed.');

  const instrumentedCode = instrument(code, options);
  writeFile(outputPath, instrumentedCode);
  if (detail) log(`Instrumented file written to \`${outputPath}\`.`);

  return instrumentedCode;
}

// return the instrumented code
export function instrument(code: string, options: Options = {}): string {
  if (options.detail) header('Instrumenting the code...');
  const ast = parse(code);
  const state = new State(options);
  if (options.detail) log(stringify(ast));

  let output = code

  if (code.indexOf(NO_INSTRUMENT) == -1) {
    state.walk(ast);
    output = `// INSTRUMENTED BY DYNAJS
${state.output}`;
  }
  output = `${NO_INSTRUMENT}
${DYNAJS_VAR}.ids = ${JSON.stringify(idToLoc)};
${output}`;

  if (options.detail) log(output.trim());
  return output;
}

// -----------------------------------------------------------------------------
// states for walking the AST
// -----------------------------------------------------------------------------
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
  detail: boolean;
  isEnabled: FeatureTagCheck;
  inDerivedClass: boolean;
  isDerivedConstructor: boolean;
  isStrict: boolean;

  constructor(options: Options = {}) {
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
    this.detail = options.detail ?? false;
    this.isEnabled = Object.freeze(options.isEnabled ?? { ...FEATURE_CHECK_ALL_TRUE });
    this.inDerivedClass = false;
    this.isDerivedConstructor = false;
    this.isStrict = false;
  }

  // execute body with isLHS = true
  withLHS<T>(body: () => T): T {
    const prev = this.isLHS;
    this.isLHS = true;
    const result = body();
    this.isLHS = prev;
    return result;
  }

  // create a new scope
  createScope(body: (scope: Scope) => void, forLexical: boolean = false): void {
    const scope = new Scope(this.scope, forLexical);
    body(scope);
    this.scope = scope;
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

  // walk the AST nodes in an array recursively
  walk(node: Node): void {
    // @ts-ignore
    visitors[node.type](node, this);
  }

  // walk the AST nodes in an array recursively with newline
  walkln(node: Node): void {
    this.write(this.lineEnd);
    this.write(this.indent.repeat(this.indentLevel));
    this.walk(node);
  }

  // walk the AST nodes in an array recursively
  walkArray(
    nodes: Node[],
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

function hasUseStrictDirective(body: readonly Node[]): boolean {
  for (const statement of body) {
    if (statement.type !== 'ExpressionStatement') return false;
    const expr = (statement as any).expression;
    if (expr.type !== 'Literal' || expr.value !== 'use strict') return false;
    return true;
  }
  return false;
}

// state options
interface Options {
  write?: (str: string) => void
  indent?: string
  lineEnd?: string
  instrumentedPath?: string
  originalPath?: string
  detail?: boolean
  isEnabled?: FeatureTagCheck
}

// -----------------------------------------------------------------------------
// scope
// -----------------------------------------------------------------------------
class Scope {
  vars: { [name: string]: VarKind };
  spreadVars: Set<string>;
  parent: Scope | null;
  private forLexical: boolean;

  constructor(parent: Scope | null, forLexical: boolean) {
    this.vars = {};
    this.spreadVars = new Set();
    this.parent = parent;
    this.forLexical = forLexical;
  }

  walk(node: Node): void {
    if (!this.forLexical) recursive(node, this, Scope.visitors);
    recursive(node, this, Scope.lexicalVisitors);
  }

  walkArray(nodes: Node[]) {
    for (const node of nodes) {
      this.walk(node);
    }
  }

  walkFunction(node: Node, isExpr: boolean) {
    const func = node as Function;
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
    // If a named function expression has its name shadowed by a lexical
    // binding (const/let) at the top level of the function body, update the
    // scope to reflect the shadowing kind so callers can detect the TDZ.
    if (isExpr && func.id != null && func.body.type === 'BlockStatement') {
      const stmts = (func.body as any).body as any[];
      for (const stmt of stmts) {
        if (stmt.type === 'VariableDeclaration' &&
            (stmt.kind === 'let' || stmt.kind === 'const')) {
          for (const decl of stmt.declarations) {
            for (const x of collectIdentifiers(decl.id as Pattern)) {
              if (x === func.id.name) {
                this.vars[x] = stmt.kind === 'let' ? VarKind.Let : VarKind.Const;
              }
            }
          }
        }
      }
    }
  }

  walkCatch(node: Node) {
    const catchClause = node as CatchClause;
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
    FunctionExpression: (node, scope, c) => {},
    ArrowFunctionExpression: (node, scope, c) => {},
    ClassDeclaration: (node, scope, c) => {
      const { id } = node;
      if (id != null) {
        scope.vars[id.name] = VarKind.Class;
      }
    },
    ClassExpression: (node, scope, c) => {},
  }

  static lexicalVisitors: RecursiveVisitors<Scope> = {
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
    FunctionDeclaration: (node, scope, c) => {},
    FunctionExpression: (node, scope, c) => {},
    ArrowFunctionExpression: (node, scope, c) => {},
    ClassDeclaration: (node, scope, c) => {},
    ClassExpression: (node, scope, c) => {},
  }
}

// -----------------------------------------------------------------------------
// logging functions
// -----------------------------------------------------------------------------

// logging script enter
function logScriptEnter(state: State, program: Node): void {
  if (!state.isEnabled.Se) return;
  const { instrumentedPath: i, originalPath: o } = state;
  state.writeln(`${LOG.SCRIPT_ENTER}(${newId(program)}, "${i}", "${o}");`);
}

// logging script exit
function logScriptExit(state: State, program: Node): void {
  if (!state.isEnabled.Se) return;
  state.writeln(`${LOG.SCRIPT_EXIT}(${newId(program)});`);
}

// logging a function call
function logCall(state: State, callee: Node, isConstructor: boolean, callOptional: boolean): void {
  if (!state.isEnabled.F) {
    if (isConstructor) state.write('new ');
    state.walk(callee);
    return;
  }
  if (callee.type === 'MemberExpression') {
    const { object, property, computed, optional } = callee as MemberExpression;
    if (object.type === 'Super') {
      // TODO: super hooking
      if (isConstructor) state.write('new ');
      state.write('super');
      if (computed) {
        state.write(optional ? '?.[' : '[');
        state.walk(property);
        state.write(']');
      } else if (property.type === 'Identifier') {
        state.write(optional ? `?.${property.name}` : `.${property.name}`);
      } else if (property.type === 'PrivateIdentifier') {
        state.write(`#${(property as any).name}`);
      }
      return;
    }
    if (property.type === 'PrivateIdentifier') {
      // TODO: report private field access — bracket notation cannot reach private slots
      if (isConstructor) state.write('new ');
      state.walk(object);
      state.write(optional ? `?.#${(property as any).name}` : `.#${(property as any).name}`);
      return;
    }
    state.write(`${LOG.METHOD_CALL}(${newId(callee)}, `);
    state.walk(object);
    state.write(', ');
    if (computed) {
      state.walk(property);
    } else if (property.type === 'Identifier') {
      state.write(`"${property.name}"`);
    } else {
      warn(`MemberExpression: unexpected property type${getLocStr(callee)}`);
    }
    state.write(`, ${isConstructor}, ${optional}, ${callOptional})`);
  } else if (callee.type === 'Super') {
    // TODO: super hooking
    state.write('super');
  } else {
    state.write(`${LOG.FUNCTION_CALL}(${newId(callee)}, `);
    state.walk(callee);
    state.write(`, ${isConstructor}, ${callOptional})`);
  }
}

// logging a tagged template call (uses TF/TM hooks with general-first hierarchy)
function logTaggedCall(state: State, tag: Node): void {
  if (!state.isEnabled.TF) {
    state.walk(tag);
    return;
  }
  if (tag.type === 'MemberExpression') {
    const { object, property, computed } = tag as MemberExpression;
    if (object.type === 'Super') {
      // TODO: super hooking
      state.write('super');
      if (computed) {
        state.write('[');
        state.walk(property);
        state.write(']');
      } else if (property.type === 'Identifier') {
        state.write(`.${property.name}`);
      } else if (property.type === 'PrivateIdentifier') {
        state.write(`#${(property as any).name}`);
      }
      return;
    }
    if (property.type === 'PrivateIdentifier') {
      // TODO: report private field access — bracket notation cannot reach private slots
      state.walk(object);
      state.write(`.#${(property as any).name}`);
      return;
    }
    state.write(`${LOG.TAGGED_METHOD}(${newId(tag)}, `);
    state.walk(object);
    state.write(', ');
    if (computed) {
      state.walk(property);
    } else if (property.type === 'Identifier') {
      state.write(`"${property.name}"`);
    } else {
      warn(`TaggedTemplate MemberExpression: unexpected property type${getLocStr(tag)}`);
    }
    state.write(')');
  } else if (tag.type === 'Super') {
    // TODO: super hooking
    state.write('super');
  } else {
    state.write(`${LOG.TAGGED_FUNC}(${newId(tag)}, `);
    state.walk(tag);
    state.write(')');
  }
}

// logging class
function logClassDeclare(state: State, node: Node, isExpr: boolean): void {
  const { id, superClass, body } = node as Class;
  state.write('class ');
  if (id) state.write(id.name + ' ');
  if (superClass) {
    state.write('extends ');
    state.walk(superClass);
    state.write(' ');
  }
  state.write('{');
  const prevInDerivedClass = state.inDerivedClass;
  state.inDerivedClass = !!superClass;
  state.wrap(() => state.walk(body));
  state.inDerivedClass = prevInDerivedClass;
  state.writeln('}');
}

// logging function declaration
function logFuncDeclare(state: State, node: Node, isExpr: boolean): void {
  const { id, generator, async } = node as Function;
  state.write(async ? 'async ' : '');
  state.write(generator ? 'function* ' : 'function ');
  if (id != null) state.write(id.name);
  logFunc(state, node, isExpr);
}

// logging arrow function declaration
function logArrowFuncDeclare(state: State, node: Node): void {
  const { async } = node as Function;
  state.write(async ? 'async ' : '');
  logFunc(state, node, true, true);
}

// logging function tail
function logFunc(state: State, node: Node, isExpr: boolean, isArrow: boolean = false): void {
  state.createScope(scope => scope.walkFunction(node, isExpr));
  const { params, body, type, id } = node as Function;
  const strict = state.isStrict || (body.type === 'BlockStatement' && hasUseStrictDirective(body.body as Node[]));
  state.write('(');
  state.withLHS(() => state.walkArray(params));
  state.write(isArrow ? ') => {' : ') {');
  state.withStrictMode(strict, () => {
    state.wrap(() => {
      state.writeln('try {');
      state.wrap(() => {
        logFuncEnter(state, node as Function);
        logDeclare(state, node);
        if (body.type === 'BlockStatement') {
          for (const statement of body.body) {
            state.writeln('');
            state.walk(statement);
          }
        } else {
          state.writeln('');
          logReturn(state, body, () => logExpression(state, body));
        }
      });
      state.writeln(`} catch (${EXCEPTION_VAR}) {`);
      state.wrap(() => {
        logException(state, node);
      });
      state.writeln(`} finally {`);
      state.wrap(() => {
        logFuncExit(state, node);
      });
      state.writeln(`}`);
    });
  });
  state.writeln('}');
}

// logging function enter
function logFuncEnter(state: State, func: Function): void {
  if (!state.isEnabled.Fe) return;
  const { id } = func;
  let name: string;
  if (id == null) {
    // TODO: temporalily use `null` but we need to discuss how to handle this
    name = 'null';
  } else {
    // If the function name is shadowed by a TDZ binding (const/let/class) in
    // the function body scope, accessing the identifier would throw a
    // ReferenceError, so use `null` instead.
    const kind = state.scope?.vars[id.name];
    const isTDZ = kind === VarKind.Const || kind === VarKind.Let || kind === VarKind.Class;
    name = isTDZ ? 'null' : id.name;
  }
  // TODO: for derived class constructors, `this` is not initialized at the beginning, so use `undefined` instead
  const thisArg = state.isDerivedConstructor ? 'undefined' : 'this';
  // Arrow functions don't have their own `arguments`; build a synthetic args array from params instead
  let argsExpr: string;
  if (func.type === 'ArrowFunctionExpression') {
    const parts: string[] = [];
    let ok = true;
    for (const p of func.params) {
      if (p.type === 'Identifier') {
        parts.push((p as Identifier).name);
      } else if (p.type === 'RestElement' && p.argument.type === 'Identifier') {
        parts.push(`...${(p.argument as Identifier).name}`);
      } else {
        ok = false;
        break;
      }
    }
    argsExpr = ok ? `[${parts.join(', ')}]` : '[]';
  } else {
    argsExpr = 'arguments';
  }
  state.writeln(`${LOG.FUNC_ENTER}(${newId(func)}, ${name}, ${thisArg}, ${argsExpr});`);
}

// logging function exit
function logFuncExit(state: State, func: Node): void {
  if (!state.isEnabled.Fe) return;
  state.writeln(`${LOG.FUNC_EXIT}(${newId(func)});`);
}

// logging a return statement
function logReturn(state: State, expr: Node, body: () => void): void {
  if (!state.isEnabled.Re) {
    state.write('return ');
    body();
    state.write(';');
    return;
  }
  state.write(`return ${LOG.RETURN}(${newId(expr)}, `);
  body();
  state.write(');');
}

// logging a for-in/of statement
function logForInOfStatement(state: State, node: Node, isForIn: boolean, isAwait: boolean): void {
  const { left, right, body } = node as (ForInStatement | ForOfStatement);
  const awaitStr = isAwait ? 'await ' : '';
  const prep = isForIn ? 'in' : 'of';
  state.write(`for ${awaitStr}(${LOG.TEMP_VAR} ${prep} `);
  logForInOfObject(state, right, true);
  state.write(') {');
  state.wrap(() => {
    state.createScope(scope => scope.walk(left), true);
    logDeclare(state, left);
    state.writeln('');
    let id: Pattern;
    if (left.type === 'VariableDeclaration') {
      const { declarations, kind } = left;
      state.write(`${kind} `);
      id = declarations[0].id;
    } else {
      id = left;
    }
    logWrite(state, id, right, () => state.write(LOG.TEMP_VAR));
    state.write(';');
    state.writeln('');
    state.walk(body);
  });
  state.writeln('}');
}

// logging the RHS object of a for-in/of statement
function logForInOfObject(state: State, expr: Expression, isForIn: boolean): void {
  if (!state.isEnabled.O) {
    state.walk(expr);
    return;
  }
  state.write(`${LOG.FOR_IN_OF_OBJECT}(${newId(expr)}, `);
  state.walk(expr);
  state.write(`, ${isForIn})`);
}

// logging end of an expression
function logExpression(state: State, expr: Expression): void {
  if (!state.isEnabled.E) {
    state.walk(expr);
    return;
  }
  state.write(`${LOG.EXPRESSION}(${newId(expr)}, `);
  state.walk(expr);
  state.write(')');
}

// logging a property read (get-field) operation
function logGetField(state: State, expr: Expression): void {
  const { object, property, computed, optional } = expr as MemberExpression;
  if (!state.isEnabled.G) {
    if (object.type === 'Super') {
      // TODO: super hooking
      state.write('super');
    } else {
      state.walk(object);
    }
    if (computed) {
      state.write(optional ? '?.[' : '[');
      state.walk(property);
      state.write(']');
    } else if (property.type === 'Identifier') {
      state.write(optional ? `?.${property.name}` : `.${property.name}`);
    } else if (property.type === 'PrivateIdentifier') {
      state.write(optional ? `?.#${(property as any).name}` : `.#${(property as any).name}`);
    } else {
      warn(`MemberExpression: unexpected property type${getLocStr(expr)}`);
    }
    return;
  }
  if (object.type === 'Super') {
    // TODO: super hooking
    state.write('super');
    if (property.type === 'PrivateIdentifier') {
      state.write(`.#${(property as any).name}`);
    } else if (computed) {
      state.write(optional ? '?.[' : '[');
      state.walk(property);
      state.write(']');
    } else if (property.type === 'Identifier') {
      state.write(optional ? `?.${property.name}` : `.${property.name}`);
    } else {
      warn(`MemberExpression: unexpected property type${getLocStr(expr)}`);
    }
    return;
  }
  if (property.type === 'PrivateIdentifier') {
    // TODO: report private field access — bracket notation cannot reach private slots
    state.walk(object);
    state.write(optional ? `?.#${(property as any).name}` : `.#${(property as any).name}`);
    return;
  }
  state.write(`${LOG.GET_FIELD}(${newId(expr)}, `);
  state.walk(object);
  state.write(', ');
  if (computed) {
    state.walk(property);
  } else if (property.type === 'Identifier') {
    state.write(`"${property.name}"`);
  } else {
    warn(`MemberExpression: unexpected property type${getLocStr(expr)}`);
  }
  if (optional) state.write(', true');
  state.write(')');
}

// logging a property write (put-field) operation
function logPutField(state: State, lhs: Node, rhs: Node, body: () => void): void {
  const { object, property, computed } = lhs as MemberExpression;
  if (!state.isEnabled.P) {
    if (object.type === 'Super') {
      // TODO: super hooking
      state.write('super');
    } else {
      state.walk(object);
    }
    if (computed) {
      state.write('[');
      state.walk(property);
      state.write('] = ');
    } else if (property.type === 'Identifier') {
      state.write(`.${property.name} = `);
    } else if (property.type === 'PrivateIdentifier') {
      state.write(`.#${(property as any).name} = `);
    } else {
      warn(`MemberExpression: unexpected property type${getLocStr(lhs)}`);
    }
    body();
    return;
  }
  if (object.type === 'Super') {
    // TODO: super hooking
    state.write('super');
    if (computed) {
      state.write('[');
      state.walk(property);
      state.write('] = ');
    } else if (property.type === 'Identifier') {
      state.write(`.${property.name} = `);
    } else if (property.type === 'PrivateIdentifier') {
      state.write(`.#${(property as any).name} = `);
    } else {
      warn(`MemberExpression: unexpected property type${getLocStr(lhs)}`);
    }
    body();
    return;
  }
  if (property.type === 'PrivateIdentifier') {
    // TODO: report private field access — bracket notation cannot reach private slots
    state.walk(object);
    state.write(`.#${(property as any).name} = `);
    body();
    return;
  }
  state.write(`${LOG.PUT_FIELD}(${newId(lhs)}, `);
  state.walk(object);
  state.write(', ');
  if (computed) {
    state.walk(property);
  } else if (property.type === 'Identifier') {
    state.write(`"${property.name}"`);
  } else {
    warn(`MemberExpression: unexpected property type${getLocStr(lhs)}`);
  }
  state.write(', ');
  body();
  state.write(`, ${state.isStrict}`);
  state.write(')');
}

// logging a delete operation
function logDelete(state: State, expr: Node): void {
  if (!state.isEnabled.De) {
    if (expr.type === 'MemberExpression') {
      const { object, property, computed, optional } = expr as MemberExpression;
      state.write('delete ');
      if (object.type === 'Super') {
        state.write('super');
      } else {
        state.walk(object);
      }
      if (computed) {
        state.write(optional ? '?.[' : '[');
        state.walk(property);
        state.write(']');
      } else if (property.type === 'Identifier') {
        state.write(optional ? `?.${property.name}` : `.${property.name}`);
      } else if (property.type === 'PrivateIdentifier') {
        state.write(optional ? `?.#${(property as any).name}` : `.#${(property as any).name}`);
      } else {
        warn(`Delete operator on unexpected property type${getLocStr(expr)}`);
      }
    } else {
      state.write(`delete ${generate(expr)}`);
    }
    return;
  }
  if (expr.type === 'ChainExpression') {
    // delete a?.b — wrap with Ch to convert chainSkip → undefined
    state.write(`${LOG.CHAIN}(`);
    logDelete(state, (expr as any).expression);
    state.write(')');
  } else if (expr.type === 'MemberExpression') {
    const { object, property, computed, optional } = expr as MemberExpression;
    state.write(`${LOG.DELETE_OP}(${newId(expr)}, `);
    state.walk(object);
    state.write(', ');
    if (computed) {
      state.walk(property);
    } else if (property.type === 'Identifier') {
      state.write(`"${property.name}"`);
    } else {
      warn(`Delete operator on unexpected property type${getLocStr(expr)}`);
    }
    if (optional) state.write(', true');
    state.write(')');
  } else {
    warn(`Delete operator on unexpected type${getLocStr(expr)}`);
    state.write(`delete ${generate(expr)}`);
  }
}

// logging a unary operation (except for `delete`)
function logUnaryOp(state: State, expr: UnaryExpression): void {
  const { argument, operator } = expr;
  if (operator === 'delete') {
    logDelete(state, argument);
    return;
  }
  if (!state.isEnabled.U) {
    if (operator === 'typeof' && argument.type === 'Identifier') {
      state.write(`typeof ${(argument as Identifier).name}`);
    } else {
      state.write(`${operator} `);
      state.walk(argument);
    }
    return;
  }
  state.write(`${LOG.UNARY_OP}(${newId(expr)}, "${operator}", `);
  // special handling for `typeof x` where x is an identifier to avoid ReferenceError
  if (operator === 'typeof' && argument.type === 'Identifier') {
    var x = (argument as Identifier).name;
    state.write(`typeof ${x} === "undefined" ? undefined : `);
  }
  state.walk(argument);
  state.write(')');
}

// logging a binary operation
function logBinaryOp(state: State, expr: BinaryExpression): void {
  const { left, right, operator } = expr;
  const enabled = state.isEnabled.B;
  if (!enabled) {
    state.write('(');
    state.walk(left);
    state.write(` ${operator} `);
    state.walk(right);
    state.write(')');
    return;
  }
  state.write(`${LOG.BINARY_OP}(${newId(expr)}, "${operator}", `);
  state.walk(left);
  state.write(', ');
  state.walk(right);
  state.write(')');
}

// logging an update operation
function logUpdateOp(state: State, expr: UpdateExpression): void {
  if (!state.isEnabled.U) {
    state.write(generate(expr));
    return;
  }
  const { argument, operator, prefix } = expr;
  state.write(`${LOG.UPDATE_OP}(${newId(expr)}, ${newId(expr)}, "${operator}", ${prefix}, `);
  state.walk(argument);
  state.write(`, ${TEMP_PARAM_VAR} => `);
  logWrite(state, argument, argument, () => state.write(TEMP_PARAM_VAR));
  state.write(')');
}

// logging a condition expression
function logCondition(state: State, test: Expression, kind: string, end: boolean = false): void {
  if (!state.isEnabled.C) {
    if (end) logExpression(state, test);
    else state.walk(test);
    return;
  }
  state.write(`${LOG.CONDITION}(${newId(test)}, "${kind}", `);
  if (end) logExpression(state, test);
  else state.walk(test);
  state.write(`)`);
}

// logging the left side of a switch statement
function logSwitchLeft(state: State, discriminant: Expression): void {
  if (!state.isEnabled.C && !state.isEnabled.B) {
    logExpression(state, discriminant);
    return;
  }
  state.write(`${LOG.SWITCH_LEFT}(${newId(discriminant)}, `);
  logExpression(state, discriminant);
  state.write(')');
}

// logging the right side of a switch case
function logSwitchRight(state: State, test: Expression): void {
  if (!state.isEnabled.C && !state.isEnabled.B) {
    logExpression(state, test);
    return;
  }
  state.write(`${LOG.SWITCH_RIGHT}(${newId(test)}, `);
  logExpression(state, test);
  state.write(')');
}

// logging a variable declaration
function logDeclare(state: State, node: Node): void {
  if (!state.isEnabled.D) return;
  const vars = state.scope?.vars;
  if (!vars) return;
  const spreadVars = state.scope?.spreadVars;
  for (const name in vars) {
    const kind = vars[name];
    const isTDZ = kind === VarKind.Const || kind === VarKind.Let || kind === VarKind.Class;
    const isSpread = spreadVars?.has(name) ?? false;
    if (isTDZ) {
      state.writeln(`${LOG.DECLARE}(${newId(node)}, "${name}", ${kind}, ${isSpread});`);
    } else {
      state.writeln(`${LOG.DECLARE}(${newId(node)}, "${name}", ${kind}, ${isSpread}, ${name});`);
    }
  }
}

// logging a variable read
function logRead(state: State, node: Node, name: string): void {
  if (!state.isEnabled.R) {
    state.write(name);
    return;
  }
  state.write(`${LOG.READ}(${newId(node)}, "${name}", ${name})`);
}

// logging a variable write
function logWrite(state: State, lhs: Node, rhs: Node, body: () => void): void {
  if (lhs.type === 'MemberExpression') {
    logPutField(state, lhs, rhs, body);
  } else if (lhs.type === 'ObjectPattern' || lhs.type === 'ArrayPattern') {
    if (!state.isEnabled.W) {
      state.withLHS(() => state.walk(lhs));
      state.write(' = ');
      body();
      return;
    }
    // destructuring write
    state.withLHS(() => state.walk(lhs));
    state.write(` = ${LOG.WRITE}(${newId(rhs)}, `);
    const xs = collectIdentifiers(lhs as Pattern);
    state.write(`[${xs.map(x => `"${x}"`).join(', ')}], `);
    body();
    state.write(')');
  } else {
    if (!state.isEnabled.W) {
      const x = lhs as Identifier;
      state.write(`${x.name} = `);
      body();
      return;
    }
    // variable write
    const x = lhs as Identifier;
    state.write(`${x.name} = ${LOG.WRITE}(${newId(rhs)}, `);
    const xs = collectIdentifiers(lhs as Pattern);
    state.write(`[${xs.map(x => `"${x}"`).join(', ')}], `);
    body();
    state.write(')');
  }
}

// logging a literal
function logLiteral(state: State, literal: Node, body?: () => void): void {
  const enabled = state.isEnabled.L;
  if (!enabled) {
    // to handle iife like (function(){})() or (function () {}).call(...)
    const isFunctionLike = literal.type === 'FunctionExpression' || literal.type === 'ClassExpression' || literal.type === 'ArrowFunctionExpression';
    if (isFunctionLike) state.write('(');
    if (body) body();
    else state.write(generate(literal));
    if (isFunctionLike) state.write(')');
    return;
  }
  state.write(`${LOG.LITERAL}(${newId(literal)}, `);
  if (body) body();
  else state.write(generate(literal));
  state.write(`)`);
}

// logging a throw statement
function logThrow(state: State, arg: Expression): void {
  if (!state.isEnabled.Th) {
    logExpression(state, arg);
    return;
  }
  state.write(`${LOG.THROW}(${newId(arg)}, `);
  logExpression(state, arg);
  state.write(')');
}

// logging a yield expression
function logYield(state: State, node: Node, argument: Node | null | undefined, delegate: boolean): void {
  if (!state.isEnabled.Y) {
    if (!argument) {
      state.write('(yield)');
    } else {
      state.write(delegate ? 'yield*' : 'yield');
      state.write(' ');
      logExpression(state, argument as Expression);
    }
    return;
  }
  state.write(`${LOG.YIELD_RESULT}(${newId(node)}, yield${delegate ? '*' : ''} ${LOG.YIELD}(${newId(node)}, `);
  if (argument) {
    logExpression(state, argument as Expression);
  } else {
    state.write('undefined');
  }
  state.writeln(`, ${delegate}))`);
}

// logging an await expression
function logAwait(state: State, node: Node, argument: Node | null | undefined): void {
  if (!state.isEnabled.Aw) {
    state.write('await ');
    if (argument) {
      logExpression(state, argument as Expression);
    } else {
      state.write('undefined');
    }
    return;
  }
  state.write(`${LOG.AWAIT_RESULT}(${newId(node)}, await ${LOG.AWAIT}(${newId(node)}, `);
  if (argument) {
    logExpression(state, argument as Expression);
  } else {
    state.write('undefined');
  }
  state.write(`))`);
}

// logging an exception
function logException(state: State, program: Node): void {
  state.writeln(`${LOG.EXCEPTION}(${newId(program)}, ${EXCEPTION_VAR});`);
}

// -----------------------------------------------------------------------------
// unique id generator
// -----------------------------------------------------------------------------
let idToLoc: { [id: number]: [number, number, number, number] } = {};
let numId = 0;
const ID_INC_STEP = 1;
function newId(node: Node): number {
  var id = numId;
  numId += ID_INC_STEP;
  if (node.loc) {
    idToLoc[id] = getLocFromNode(node);
  }
  return id;
}

function needsChainBoundary(state: State, node: Node): boolean {
  switch (node.type) {
    case 'MemberExpression': {
      const expr = node as MemberExpression;
      return (expr.optional && state.isEnabled.G) || needsChainBoundary(state, expr.object);
    }
    case 'CallExpression': {
      const expr = node as any;
      return state.isEnabled.F || needsChainBoundary(state, expr.callee);
    }
    case 'ChainExpression':
      return needsChainBoundary(state, (node as any).expression);
    case 'UnaryExpression':
      return (node as UnaryExpression).operator === 'delete' && state.isEnabled.De;
    default:
      return false;
  }
}

// -----------------------------------------------------------------------------
// visitors
// -----------------------------------------------------------------------------
type Visitors = {
  [type in AnyNode['type']]?:
    (node: Extract<AnyNode, { type: type }>, state: State) => void
}

const visitors: Visitors = {
  Identifier: (node, state) => {
    if (state.isLHS) {
      state.write(node.name);
    } else {
      logRead(state, node, node.name);
    }
  },
  Literal: (node, state) => {
    const { value } = node;
    const type = typeof value;
    logLiteral(state, node);
  },
  Program: (node, state) => {
    const { body } = node;
    const strict = state.isStrict || hasUseStrictDirective(body as Node[]);
    state.withStrictMode(strict, () => {
      state.createScope(scope => scope.walkArray(body));
      state.writeln('try {');
      state.wrap(() => {
        logScriptEnter(state, node);
        logDeclare(state, node);
        for (const statement of body) {
          state.writeln('');
          state.walk(statement);
        }
      });
      state.writeln(`} catch (${EXCEPTION_VAR}) {`);
      state.wrap(() => {
        logException(state, node);
      });
      state.writeln(`} finally {`);
      state.wrap(() => {
        logScriptExit(state, node);
      });
      state.writeln(`}`);
    });
  },
  ExpressionStatement: (node, state) => {
    const { expression } = node;
    logExpression(state, expression);
    state.write(';');
  },
  BlockStatement: (node, state) => {
    const { body } = node;
    state.createScope(scope => scope.walkArray(body), true);
    state.write('{');
    state.wrap(() => {
      logDeclare(state, node);
      for (const statement of body) {
        state.writeln('');
        state.walk(statement);
      }
    });
    state.writeln('}');
  },
  EmptyStatement: (node, state) => {
    state.write(';');
  },
  DebuggerStatement: (node, state) => {
    state.write('debugger;');
  },
  WithStatement: (node, state) => {
    todo('WithStatement');
  },
  ReturnStatement: (node, state) => {
    const arg = node.argument;
    logReturn(state, node, () => {
      if (arg) logExpression(state, arg);
      else state.write('undefined');
    });
  },
  LabeledStatement: (node, state) => {
    const { label, body } = node;
    state.write(`${label.name}: `);
    state.walk(body);
  },
  BreakStatement: (node, state) => {
    const { label } = node;
    state.write('break');
    if (label != null) {
      state.write(` ${label.name}`);
    }
  },
  ContinueStatement: (node, state) => {
    const { label } = node;
    state.write('continue');
    if (label != null) {
      state.write(` ${label.name}`);
    }
  },
  IfStatement: (node, state) => {
    const { test, consequent, alternate } = node;
    state.write('if (');
    logCondition(state, test, 'if', true);
    state.write(') ');
    state.walk(consequent);
    if (alternate != null) {
      state.write(' else ');
      state.walk(alternate);
    }
  },
  SwitchStatement: (node, state) => {
    const { discriminant, cases } = node;
    state.write('switch (');
    logSwitchLeft(state, discriminant);
    state.write(') {');
    state.wrap(() => {
      for (const switchCase of cases) {
        state.writeln('');
        state.walk(switchCase);
      }
    });
    state.writeln('}');
  },
  SwitchCase: (node, state) => {
    const { test, consequent } = node;
    if (test != null) {
      state.write('case ');
      logSwitchRight(state, test);
      state.write(':');
    } else {
      state.write('default:');
    }
    state.wrap(() => {
      for (const statement of consequent) {
        state.writeln('');
        state.walk(statement);
      }
    });
  },
  ThrowStatement: (node, state) => {
    const { argument } = node;
    state.write('throw ');
    logThrow(state, argument);
    state.write(';');
  },
  TryStatement: (node, state) => {
    const { block, handler, finalizer } = node;
    state.write('try ');
    state.walk(block);
    if (handler != null) {
      state.write(' ');
      state.walk(handler);
    }
    if (finalizer != null) {
      state.write(' finally ');
      state.walk(finalizer);
    }
  },
  CatchClause: (node, state) => {
    const { param, body } = node;
    state.createScope(scope => scope.walkCatch(node));
    state.write('catch ');
    if (param != null) {
      state.write('(');
      state.withLHS(() => state.walk(param));
      state.write(') {');
      state.wrap(() => {
        logDeclare(state, node);
        state.writeln('');
        state.walk(body);
      });
      state.writeln('}');
    } else {
      state.walk(body);
    }
  },
  WhileStatement: (node, state) => {
    const { test, body } = node;
    state.write('while (');
    logCondition(state, test, 'while', true);
    state.write(') ');
    state.walk(body);
  },
  DoWhileStatement: (node, state) => {
    const { test, body } = node;
    state.write('do ');
    state.walk(body);
    state.write(' while (');
    logCondition(state, test, 'do-while', true);
    state.write(');');
  },
  ForStatement: (node, state) => {
    const { init, test, update, body } = node;
    // handle lexical declarations in for-loop initializer
    if (init != null &&
        init.type === 'VariableDeclaration' &&
        (init.kind === 'let' || init.kind === 'const')) {
      state.createScope(scope => scope.walk(init), true);
      state.write('{');
      state.wrap(() => {
        logDeclare(state, init);
        state.writeln('');
        head();
        state.write('{');
        state.wrap(() => {
          state.writeln('');
          state.walk(body);
          logDeclare(state, init);
        });
        state.writeln('}');
      });
      state.writeln('}');
    } else {
      // normal for-loop
      head();
      state.walk(body);
    }
    // general head function
    function head() {
      state.write('for (');
      if (init != null) {
        if (init.type === 'VariableDeclaration') {
          state.walk(init);
          state.write(' ');
        } else {
          logExpression(state, init);
          state.write('; ');
        }
      } else {
        state.write('; ');
      }
      if (test != null) logCondition(state, test, 'for', true);
      state.write('; ');
      if (update != null) logExpression(state, update);
      state.write(') ');
    }
  },
  ForInStatement: (node, state) => {
    logForInOfStatement(state, node, true, false);
  },
  FunctionDeclaration: (node, state) => {
    logFuncDeclare(state, node, false);
  },
  VariableDeclaration: (node, state) => {
    const { kind, declarations } = node;
    state.write(kind + ' ');
    state.walkArray(declarations);
    state.write(';');
  },
  VariableDeclarator: (node, state) => {
    const { id, init } = node;
    if (init == null) {
      state.withLHS(() => state.walk(id));
    } else {
      logWrite(state, id, init, () => logExpression(state, init));
    }
  },
  ThisExpression: (node, state) => {
    logRead(state, node, 'this');
  },
  ArrayExpression: (node, state) => {
    logLiteral(state, node, () => {
      const { elements } = node;
      state.write('[');
      for (const elem of elements) {
        if (elem != null) {
          state.walk(elem);
        }
        state.write(', ');
      }
      state.write(']');
    });
  },
  ObjectExpression: (node, state) => {
    logLiteral(state, node, () => {
      const { properties } = node;
      state.write('{');
      state.wrap(() => {
        for (const prop of properties) {
          state.writeln('');
          state.walk(prop);
          state.write(', ');
        }
      });
      state.writeln('}');
    });
  },
  Property: (node, state) => {
    const { key, value, kind, method, shorthand, computed } = node;
    if (kind !== 'init') state.write(`${kind} `);
    if (method) {
      const func = value as Function;
      if (func.async) state.write('async ');
      if (func.generator) state.write('*');
    }
    if (computed) {
      state.write('[');
      state.walk(key);
      state.write(']');
    } else {
      if (key.type === 'Identifier') {
        state.write(key.name);
      } else {
        state.write(generate(key));
      }
    }
    if (shorthand) {
      state.write(': ');
      state.walk(value);
    } else if (method) {
      logFunc(state, value, true);
    } else if (kind === 'init') {
      switch (value.type) {
        case 'AssignmentPattern': 
          state.write('= ');
          state.walk(value);
          break;
        default:
          state.write(': ');
          state.walk(value);
      }
    } else { // kind is 'get' or 'set'
      logFunc(state, value, true);
    }
  },
  FunctionExpression: (node, state) => {
    logLiteral(state, node, () => {
      logFuncDeclare(state, node, true);
    });
  },
  UnaryExpression: (node, state) => {
    logUnaryOp(state, node);
  },
  UpdateExpression: (node, state) => {
    logUpdateOp(state, node);
  },
  BinaryExpression: (node, state) => {
    logBinaryOp(state, node);
  },
  AssignmentExpression: (node, state) => {
    const { left, right, operator } = node;
    const enabled = true // set to true for now; additional parenthesis is needed
    if (enabled) state.write('(');
    switch (operator) {
      case '=': {
        logWrite(state, left, right, () => state.walk(right));
        break;
      }
      default: {
        // TODO: apply injection to the left-hand side
        state.write(generate(left));
        state.write(` ${operator} `);
        state.walk(right);
      }
    }
    if (enabled) state.write(')');
  },
  LogicalExpression: (node, state) => {
    const { left, right, operator } = node;
    const isDisabled = true // set to true for now; additional parenthesis is needed
    if (isDisabled) state.write('(');
    logCondition(state, left, operator);
    state.write(` ${operator} (`);
    state.walk(right);
    state.write(')');
    if (isDisabled) state.write(')');
  },
  MemberExpression: (node, state) => {
    if (state.isLHS) {
      // assignment target (e.g. element in destructuring pattern) — cannot wrap
      // in D$.G(...) because that produces a value, not an lvalue; instead write
      // the plain member access while still logging reads for object/property
      const { object, property, computed, optional } = node as MemberExpression;
      const prev = state.isLHS;
      state.isLHS = false;
      state.walk(object);
      state.isLHS = prev;
      if (computed) {
        state.write(optional ? '?.[' : '[');
        state.isLHS = false;
        state.walk(property);
        state.isLHS = prev;
        state.write(']');
      } else if (property.type === 'Identifier') {
        state.write(optional ? `?.${property.name}` : `.${property.name}`);
      } else if (property.type === 'PrivateIdentifier') {
        state.write(optional ? `?.#${(property as any).name}` : `.#${(property as any).name}`);
      }
      return;
    }
    logGetField(state, node);
  },
  ConditionalExpression: (node, state) => {
    const { test, consequent, alternate } = node;
    logCondition(state, test, '?');
    state.write(' ? ');
    state.walk(consequent);
    state.write(' : ');
    state.walk(alternate);
  },
  CallExpression: (node, state) => {
    const { callee, arguments: args, optional } = node;
    logCall(state, callee, false, optional);
    state.write('(');
    state.walkArray(args);
    state.write(')');
  },
  NewExpression: (node, state) => {
    const { callee, arguments: args } = node;
    logCall(state, callee, true, false);
    state.write('(');
    state.walkArray(args);
    state.write(')');
  },
  SequenceExpression: (node, state) => {
    state.write('(');
    state.walkArray(node.expressions, ', ');
    state.write(')');
  },
  ForOfStatement: (node, state) => {
    // TODO: await should be hooked in some way
    logForInOfStatement(state, node, false, node.await);
  },
  Super: (node, state) => {
    // TODO: super hooking
    state.write('super');
  },
  SpreadElement: (node, state) => {
    state.write('...');
    state.walk(node.argument);
  },
  ArrowFunctionExpression: (node, state) => {
    logLiteral(state, node, () => {
      logArrowFuncDeclare(state, node);
    });
  },
  YieldExpression: (node, state) => {
    logYield(state, node, node.argument, node.delegate);
  },
  TemplateLiteral: (node, state) => {
    // TODO it is not distinguished with string literal for the user
    logLiteral(state, node, () => {
      const { quasis, expressions } = node;
      state.write('`');
      const length = expressions.length;

      for (let i = 0; i < length; i++) {
        state.walk(quasis[i]);
        state.write('${');
        state.walk(expressions[i]);
        state.write('}');
      }
      state.walk(quasis[quasis.length - 1]);
      state.write('`');
    });
  },
  TaggedTemplateExpression: (node, state) => {
    logTaggedCall(state, node.tag);
    const { quasis, expressions } = node.quasi;
    state.write('`');
    const length = expressions.length;
    for (let i = 0; i < length; i++) {
      state.walk(quasis[i]);
      state.write('${');
      state.walk(expressions[i]);
      state.write('}');
    }
    state.walk(quasis[quasis.length - 1]);
    state.write('`');
  },
  TemplateElement: (node, state) => {
    state.write(node.value.raw);
  },
  ObjectPattern: (node, state) => {
    const { properties } = node as { properties: Node[] };
    state.write('{');
    for (let i = 0; i < properties.length; i++) {
      if (i > 0) state.write(', ');
      state.walk(properties[i]);
    }
    state.write('}');
  },
  ArrayPattern: (node, state) => {
    const { elements } = node as { elements: Node[] };
    state.write('[');
    for (let i = 0; i < elements.length; i++) {
      if (i > 0) state.write(', ');
      const elem = elements[i];
      if (elem != null) state.walk(elem);
    }
    state.write(']');
  },
  RestElement: (node, state) => {
    state.write('...');
    state.walk(node.argument);
  },
  AssignmentPattern: (node, state) => {
    state.walk(node.left);
    state.write(' = ');
    const prev = state.isLHS;
    state.isLHS = false;
    logExpression(state, node.right as Expression);
    state.isLHS = prev;
  },
  ClassBody: (node, state) => {
    for (const elem of node.body) {
      state.writeln('');
      state.walk(elem);
    }
  },
  MethodDefinition: (node, state) => {
    const { key, value, kind, computed, static: _static } = node;
    if (kind === 'constructor') {
        state.write('constructor');
    } else {
      if (_static) state.write('static ');
      if (value.async) state.write('async ');
      if (value.generator) state.write('*');
      if (kind === 'get') state.write('get ');
      if (kind === 'set') state.write('set ');
      if (computed) {
        state.write('[');
        state.walk(key);
        state.write(']');
      } else {
        state.withLHS(() => state.walk(key));
      }
    }
    const isDerivedConstructor = kind === 'constructor' && state.inDerivedClass;
    if (isDerivedConstructor) state.isDerivedConstructor = true;
    logFunc(state, value, true);
    if (isDerivedConstructor) state.isDerivedConstructor = false;
  },
  ClassDeclaration: (node, state) => {
    logClassDeclare(state, node, false);
  },
  ClassExpression: (node, state) => {
    logLiteral(state, node, () => {
      logClassDeclare(state, node, true);
    });
  },
  MetaProperty: (node, state) => {
    const name = `${node.meta.name}.${node.property.name}`;
    logRead(state, node, name);
  },
  ImportDeclaration: (node, state) => {
    todo('ImportDeclaration');
  },
  ImportSpecifier: (node, state) => {
    todo('ImportSpecifier');
  },
  ImportDefaultSpecifier: (node, state) => {
    todo('ImportDefaultSpecifier');
  },
  ImportNamespaceSpecifier: (node, state) => {
    todo('ImportNamespaceSpecifier');
  },
  ImportAttribute: (node, state) => {
    todo('ImportAttribute');
  },
  ExportNamedDeclaration: (node, state) => {
    todo('ExportNamedDeclaration');
  },
  ExportSpecifier: (node, state) => {
    todo('ExportSpecifier');
  },
  ExportDefaultDeclaration: (node, state) => {
    todo('ExportDefaultDeclaration');
  },
  ExportAllDeclaration: (node, state) => {
    todo('ExportAllDeclaration');
  },
  AwaitExpression: (node, state) => {
    logAwait(state, node, node.argument);
  },
  ChainExpression: (node, state) => {
    if (!needsChainBoundary(state, node.expression)) {
      state.walk(node.expression);
      return;
    }
    state.write(`${LOG.CHAIN}(`);
    state.walk(node.expression);
    state.write(')');
  },
  ImportExpression: (node, state) => {
    todo('ImportExpression');
  },
  ParenthesizedExpression: (node, state) => {
    state.write('(');
    state.walk(node.expression);
    state.write(')');
  },
  PropertyDefinition: (node, state) => {
    const { key, value, computed, static: _static } = node;
    if (_static) state.write('static ');
    if (computed) {
      state.write('[');
      state.walk(key);
      state.write(']');
    } else if (key.type === 'PrivateIdentifier') {
      state.write('#' + (key as any).name);
    } else {
      state.withLHS(() => state.walk(key));
    }

    if (!state.isEnabled.Fi && !computed) {
      if (value) {
        state.write(' = ');
        state.walk(value);
      }
      state.write(';');
      return;
    }

    const id = newId(node);
    state.write(` = ${LOG.FIELD_INIT}(${id}, this, `);
    if (computed) {
      state.walk(key);
    } else if (key.type === 'PrivateIdentifier') {
      state.write(`"#${(key as any).name}"`);
    } else {
      state.write(`"${(key as Identifier).name}"`);
    }
    state.write(`, ${_static}, `);
    if (value) {
      state.walk(value);
    } else {
      state.write('undefined');
    }
    state.write(');');
  },
  PrivateIdentifier: (node, state) => {
    state.write('#' + node.name);
  },
  StaticBlock: (node, state) => {
    const { body } = node as any;
    state.createScope(scope => scope.walkArray(body));
    state.write('static {');
    state.wrap(() => {
      if (!state.isEnabled.SBe) {
        logDeclare(state, node);
        for (const statement of body) {
          state.writeln('');
          state.walk(statement);
        }
        return;
      }
      state.writeln('try {');
      state.wrap(() => {
        state.writeln(`${LOG.STATIC_BLOCK_ENTER}(${newId(node)}, this);`);
        logDeclare(state, node);
        for (const statement of body) {
          state.writeln('');
          state.walk(statement);
        }
      });
      state.writeln(`} catch (${EXCEPTION_VAR}) {`);
      state.wrap(() => {
        logException(state, node);
      });
      state.writeln(`} finally {`);
      state.wrap(() => {
        state.writeln(`${LOG.STATIC_BLOCK_EXIT}(${newId(node)});`);
      });
      state.writeln(`}`);
    });
    state.writeln('}');
  },
}

// -----------------------------------------------------------------------------
// helpers
// -----------------------------------------------------------------------------
// collect all identifiers in a pattern
function collectIdentifiers(node: Pattern): string[] {
  const ids: string[] = [];
  function collect(node: Pattern): void {
    switch (node.type) {
      case 'Identifier':
        ids.push(node.name);
        break;
      case 'ObjectPattern':
        for (const prop of node.properties) {
          switch (prop.type) {
            case 'Property':
              collect(prop.value);
              break;
            case 'RestElement':
              collect(prop.argument);
              break;
          }
        }
        break;
      case 'ArrayPattern':
        for (const elem of node.elements) {
          if (elem != null) {
            switch (elem.type) {
              case 'Identifier':
                ids.push(elem.name);
                break;
              case 'RestElement':
                collect(elem.argument);
                break;
              default:
                collect(elem);
                break;
            }
          }
        }
        break;
      case 'RestElement':
        collect(node.argument);
        break;
      case 'AssignmentPattern':
        collect(node.left);
        break;
      case 'MemberExpression':
        // assignment target, not a new variable binding
        break;
      default:
        todo(`collectIdentifiers: ${(node as Node).type}`);
    }
  }
  collect(node);
  return ids;
}

// collect identifiers that are declared via rest/spread patterns
function collectRestIdentifiers(node: Pattern): string[] {
  const ids: string[] = [];
  function collect(node: Pattern): void {
    switch (node.type) {
      case 'RestElement':
        ids.push(...collectIdentifiers(node.argument as Pattern));
        break;
      case 'ObjectPattern':
        for (const prop of node.properties) {
          if (prop.type === 'RestElement') {
            ids.push(...collectIdentifiers(prop.argument));
          } else {
            collect(prop.value as Pattern);
          }
        }
        break;
      case 'ArrayPattern':
        for (const elem of node.elements) {
          if (elem != null) collect(elem);
        }
        break;
      case 'AssignmentPattern':
        collect(node.left);
        break;
    }
  }
  collect(node);
  return ids;
}

function getLocStr(node: Node): string {
  if (!node.loc) return '';
  const loc = getLocFromNode(node);
  return ` @ ${locToStr(loc)}`;
}
