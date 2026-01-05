import {
  DYNAJS_VAR,
  EXCEPTION_VAR,
  TEMP_PARAM_VAR,
  NO_INSTRUMENT,
} from './constants';
import {
  AnyNode,
  BinaryExpression,
  CatchClause,
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
  getInstrumentedName,
  header,
  log,
  parse,
  readFile,
  stringify,
  todo,
  warn,
  writeFile,
  VarKind,
  kindToStr,
  strToKind,
} from './utils';

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

// state options
interface Options {
  write?: (str: string) => void
  indent?: string
  lineEnd?: string
  instrumentedPath?: string
  originalPath?: string
  detail?: boolean
}

// -----------------------------------------------------------------------------
// scope
// -----------------------------------------------------------------------------
class Scope {
  vars: { [name: string]: VarKind };
  parent: Scope | null;
  private forLexical: boolean;

  constructor(parent: Scope | null, forLexical: boolean) {
    this.vars = {};
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
    this.vars['arguments'] = VarKind.Arguments;
    for (const param of func.params) {
      const xs = collectIdentifiers(param);
      for (const x of xs) {
        this.vars[x] = VarKind.Param;
      }
    }
    this.walk(func.body);
  }

  walkCatch(node: Node) {
    const catchClause = node as CatchClause;
    const { param, body } = catchClause;
    if (param != null) {
      const xs = collectIdentifiers(param);
      for (const x of xs) {
        this.vars[x] = VarKind.CatchParam;
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
    ClassDeclaration: (node, scope, c) => {},
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
    ClassDeclaration: (node, scope, c) => {},
    ClassExpression: (node, scope, c) => {},
  }
}

// -----------------------------------------------------------------------------
// logging functions
// -----------------------------------------------------------------------------
// logging function names
const LOG_SCRIPT_ENTER = DYNAJS_VAR + '.Se';
const LOG_SCRIPT_EXIT = DYNAJS_VAR + '.Sx';
const LOG_FUNCTION_CALL = DYNAJS_VAR + '.F';
const LOG_FUNC_ENTER = DYNAJS_VAR + '.Fe';
const LOG_FUNC_EXIT = DYNAJS_VAR + '.Fx';
const LOG_RETURN = DYNAJS_VAR + '.Re';
const LOG_FOR_IN_OF_OBJECT = DYNAJS_VAR + '.O';
const LOG_EXPRESSION = DYNAJS_VAR + '.E';
const LOG_GET_FIELD = DYNAJS_VAR + '.G';
const LOG_PUT_FIELD = DYNAJS_VAR + '.P';
const LOG_BINARY_OP = DYNAJS_VAR + '.B';
const LOG_UNARY_OP = DYNAJS_VAR + '.U';
const LOG_UPDATE_OP = DYNAJS_VAR + '.Up';
const LOG_CONDITION = DYNAJS_VAR + '.C';
const LOG_SWITCH_LEFT = DYNAJS_VAR + '.Swl';
const LOG_SWITCH_RIGHT = DYNAJS_VAR + '.Swr';
const LOG_DECLARE = DYNAJS_VAR + '.D';
const LOG_READ = DYNAJS_VAR + '.R';
const LOG_WRITE = DYNAJS_VAR + '.W';
const LOG_LITERAL = DYNAJS_VAR + '.L';
const LOG_THROW = DYNAJS_VAR + '.Th';
const LOG_EXCEPTION = DYNAJS_VAR + '.X';
const LOG_TEMP_VAR = DYNAJS_VAR + '._t';

// logging script enter
function logScriptEnter(state: State, program: Node): void {
  const { instrumentedPath: i, originalPath: o } = state;
  state.writeln(`${LOG_SCRIPT_ENTER}(${newId(program)}, "${i}", "${o}");`);
}

// logging script exit
function logScriptExit(state: State, program: Node): void {
  state.writeln(`${LOG_SCRIPT_EXIT}(${newId(program)});`);
}

// logging a function call
function logCall(state: State, callee: Node, isConstructor: boolean): void {
  if (callee.type === 'MemberExpression') {
    todo('Method call');
  } else if (callee.type === 'Super') {
    todo('Super call');
  } else {
    state.write(`${LOG_FUNCTION_CALL}(${newId(callee)}, `);
    state.walk(callee);
    state.write(`, ${isConstructor})`);
  }
}

// logging function declaration
function logFuncDeclare(state: State, node: Node, isExpr: boolean): void {
  const { id, generator, async } = node as Function;
  state.write(async ? 'async ' : '');
  state.write(generator ? 'function* ' : 'function ');
  if (id != null) state.write(id.name);
  logFunc(state, node, isExpr);
}

// logging function tail
function logFunc(state: State, node: Node, isExpr: boolean): void {
  state.createScope(scope => scope.walkFunction(node, isExpr));
  const func = node as Function;
  const { params, body } = func;
  state.write('(');
  state.withLHS(() => state.walkArray(params));
  state.write(') {');
  state.wrap(() => {
    state.writeln('try {');
    state.wrap(() => {
      logFuncEnter(state, node);
      logDeclare(state, node);
      if (body.type === 'BlockStatement') {
        for (const statement of body.body) {
          state.writeln('');
          state.walk(statement);
        }
      } else {
        todo('Function with expression body');
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
  state.writeln('}');
}

// logging function enter
function logFuncEnter(state: State, func: Node): void {
  state.writeln(`${LOG_FUNC_ENTER}(${newId(func)}, arguments.callee, this, arguments);`);
}

// logging function exit
function logFuncExit(state: State, func: Node): void {
  state.writeln(`${LOG_FUNC_EXIT}(${newId(func)});`);
}

// logging a return statement
function logReturn(state: State, node: ReturnStatement): void {
  const arg = node.argument;
  state.write(`${LOG_RETURN}(${newId(arg ?? node)}, `);
  if (arg != null) {
    logExpression(state, arg);
  } else {
    state.write('undefined');
  }
  state.write(')');
}

// logging a for-in/of statement
function logForInOfStatement(state: State, node: Node, isForIn: boolean, isAwait: boolean): void {
  const { left, right, body } = node as (ForInStatement | ForOfStatement);
  const awaitStr = isAwait ? 'await ' : '';
  const prep = isForIn ? 'in' : 'of';
  state.write(`for ${awaitStr}(${LOG_TEMP_VAR} ${prep} `);
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
    logWrite(state, id, right, () => state.write(LOG_TEMP_VAR));
    state.write(';');
    state.writeln('');
    state.walk(body);
  });
  state.writeln('}');
}

// logging the RHS object of a for-in/of statement
function logForInOfObject(state: State, expr: Expression, isForIn: boolean): void {
  state.write(`${LOG_FOR_IN_OF_OBJECT}(${newId(expr)}, `);
  state.walk(expr);
  state.write(`, ${isForIn})`);
}

// logging end of an expression
function logExpression(state: State, expr: Expression): void {
  state.write(`${LOG_EXPRESSION}(${newId(expr)}, `);
  state.walk(expr);
  state.write(')');
}

// logging a property read (get-field) operation
function logGetField(state: State, expr: Expression): void {
  const { object, property, computed, optional } = expr as MemberExpression;
  state.write(`${LOG_GET_FIELD}(${newId(expr)}, `);
  if (object.type === 'Super') {
    todo('MemberExpression: super');
  } else {
    state.walk(object);
  }
  if (optional) {
    todo('MemberExpression: optional');
  }
  state.write(', ');
  if (property.type === 'PrivateIdentifier') {
    todo('MemberExpression: private identifier');
  } else if (computed) {
    state.walk(property);
  } else if (property.type === 'Identifier') {
    state.write(`"${property.name}"`);
  } else {
    warn('MemberExpression: unexpected property type');
  }
  state.write(')');
}

// logging a property write (put-field) operation
function logPutField(state: State, lhs: Node, rhs: Node, body: () => void): void {
  const { object, property, computed, optional } = lhs as MemberExpression;
  state.write(`${LOG_PUT_FIELD}(${newId(lhs)}, `);
  if (object.type === 'Super') {
    todo('MemberExpression: super');
  } else {
    state.walk(object);
  }
  state.write(', ');
  if (property.type === 'PrivateIdentifier') {
    todo('MemberExpression: private identifier');
  } else if (computed) {
    state.walk(property);
  } else if (property.type === 'Identifier') {
    state.write(`"${property.name}"`);
  } else {
    warn('MemberExpression: unexpected property type');
  }
  state.write(', ');
  body();
  state.write(')');
}

// logging a binary operation
function logBinaryOp(state: State, expr: BinaryExpression): void {
  const { left, right, operator } = expr;
  state.write(`${LOG_BINARY_OP}(${newId(expr)}, "${operator}", `);
  state.walk(left);
  state.write(', ');
  state.walk(right);
  state.write(')');
}

// logging a unary operation (except for `delete`)
function logUnaryOp(state: State, expr: UnaryExpression): void {
  const { argument, operator } = expr;
  state.write(`${LOG_UNARY_OP}(${newId(expr)}, "${operator}", `);
  state.walk(argument);
  state.write(')');
}

// logging an update operation
function logUpdateOp(state: State, expr: UpdateExpression): void {
  const { argument, operator, prefix } = expr;
  state.write(`${LOG_UPDATE_OP}(${newId(expr)}, ${newId(expr)}, "${operator}", ${prefix}, `);
  state.walk(argument);
  state.write(`, ${TEMP_PARAM_VAR} => `);
  logWrite(state, argument, argument, () => state.write(TEMP_PARAM_VAR));
  state.write(')');
}

// logging a condition expression
function logCondition(state: State, test: Expression, kind: string, end: boolean = false): void {
  state.write(`${LOG_CONDITION}(${newId(test)}, "${kind}", `);
  if (end) logExpression(state, test);
  else state.walk(test);
  state.write(`)`);
}

// logging the left side of a switch statement
function logSwitchLeft(state: State, discriminant: Expression): void {
  state.write(`${LOG_SWITCH_LEFT}(${newId(discriminant)}, `);
  logExpression(state, discriminant);
  state.write(')');
}

// logging the right side of a switch case
function logSwitchRight(state: State, test: Expression): void {
  state.write(`${LOG_SWITCH_RIGHT}(${newId(test)}, `);
  logExpression(state, test);
  state.write(')');
}

// logging a variable declaration
function logDeclare(state: State, node: Node): void {
  const vars = state.scope?.vars;
  if (!vars) return;
  for (const name in vars) {
    const kind = vars[name];
    const isTDZ = kind === VarKind.Const || kind === VarKind.Let;
    if (isTDZ) {
      state.writeln(`${LOG_DECLARE}(${newId(node)}, "${name}", ${kind});`);
    } else {
      state.writeln(`${LOG_DECLARE}(${newId(node)}, "${name}", ${kind}, ${name});`);
    }
  }
}

// logging a variable read
function logRead(state: State, node: Node, name: string): void {
  state.write(`${LOG_READ}(${newId(node)}, "${name}", ${name})`);
}

// logging a variable write
function logWrite(state: State, lhs: Node, rhs: Node, body: () => void): void {
  if (lhs.type === 'MemberExpression') {
    logPutField(state, lhs, rhs, body);
  } else {
    // variable write
    const x = lhs as Identifier;
    state.write(`${x.name} = ${LOG_WRITE}(${newId(rhs)}, `);
    const xs = collectIdentifiers(lhs as Pattern);
    state.write(`[${xs.map(x => `"${x}"`).join(', ')}], `);
    body();
    state.write(')');
  }
}

// logging a literal
function logLiteral(state: State, literal: Node, body?: () => void): void {
  state.write(`${LOG_LITERAL}(${newId(literal)}, `);
  if (body) body();
  else state.write(generate(literal));
  state.write(`)`);
}

// logging a throw statement
function logThrow(state: State, arg: Expression): void {
  state.write(`${LOG_THROW}(${newId(arg)}, `);
  logExpression(state, arg);
  state.write(')');
}

// logging an exception
function logException(state: State, program: Node): void {
  state.writeln(`${LOG_EXCEPTION}(${newId(program)}, ${EXCEPTION_VAR});`);
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
    idToLoc[id] = [
      node.loc.start.line,
      node.loc.start.column + 1,
      node.loc.end.line,
      node.loc.end.column + 1,
    ];
  }
  return id;
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
    state.write('return');
    if (node.argument != null) state.write(' ');
    logReturn(state, node);
    state.write(';');
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
        } else {
          logExpression(state, init);
          state.write(';');
        }
      }
      state.write(' ');
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
    if (computed) {
      state.write('[');
      state.walk(key);
      state.write(']');
    } else {
      if (key.type === 'Identifier') {
        state.write(key.name);
      } else {
        state.walk(key);
      }
    }
    if (shorthand) {
      todo('Property: shorthand');
    } else if (method) {
      todo('Property: method');
    } else if (kind === 'init') {
      state.write(': ');
      state.walk(value);
    } else { // kind is 'get' or 'set'
      todo(`Property: ${kind}`);
      // TODO logFunc(state, value, false);
    }
  },
  FunctionExpression: (node, state) => {
    logLiteral(state, node, () => {
      logFuncDeclare(state, node, true);
    });
  },
  UnaryExpression: (node, state) => {
    if (node.operator === 'delete') {
      todo('UnaryExpression: delete');
    }
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
    switch (operator) {
      case '=': {
        logWrite(state, left, right, () => state.walk(right));
        break;
      }
      default: {
        todo('AssignmentExpression with operator ' + operator);
      }
    }
  },
  LogicalExpression: (node, state) => {
    const { left, right, operator } = node;
    logCondition(state, left, operator);
    state.write(` ${operator} `);
    state.walk(right);
  },
  MemberExpression: (node, state) => {
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
    const { callee, arguments: args } = node;
    logCall(state, callee, false);
    state.write('(');
    state.walkArray(args);
    state.write(')');
  },
  NewExpression: (node, state) => {
    todo('NewExpression');
  },
  SequenceExpression: (node, state) => {
    state.write('(');
    state.walkArray(node.expressions, ', ');
    state.write(')');
  },
  ForOfStatement: (node, state) => {
    if (node.await) todo('ForOfStatement: await');
    logForInOfStatement(state, node, false, node.await);
  },
  Super: (node, state) => {
    todo('Super');
  },
  SpreadElement: (node, state) => {
    todo('SpreadElement');
  },
  ArrowFunctionExpression: (node, state) => {
    todo('ArrowFunctionExpression');
  },
  YieldExpression: (node, state) => {
    todo('YieldExpression');
  },
  TemplateLiteral: (node, state) => {
    todo('TemplateLiteral');
  },
  TaggedTemplateExpression: (node, state) => {
    todo('TaggedTemplateExpression');
  },
  TemplateElement: (node, state) => {
    todo('TemplateElement');
  },
  ObjectPattern: (node, state) => {
    todo('ObjectPattern');
  },
  ArrayPattern: (node, state) => {
    todo('ArrayPattern');
  },
  RestElement: (node, state) => {
    todo('RestElement');
  },
  AssignmentPattern: (node, state) => {
    todo('AssignmentPattern');
  },
  ClassBody: (node, state) => {
    todo('ClassBody');
  },
  MethodDefinition: (node, state) => {
    todo('MethodDefinition');
  },
  ClassDeclaration: (node, state) => {
    todo('ClassDeclaration');
  },
  ClassExpression: (node, state) => {
    todo('ClassExpression');
  },
  MetaProperty: (node, state) => {
    todo('MetaProperty');
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
    todo('AwaitExpression');
  },
  ChainExpression: (node, state) => {
    todo('ChainExpression');
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
    todo('PropertyDefinition');
  },
  PrivateIdentifier: (node, state) => {
    todo('PrivateIdentifier');
  },
  StaticBlock: (node, state) => {
    todo('StaticBlock');
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
      default:
        todo(`collectIdentifiers: ${node.type}`);
    }
  }
  collect(node);
  return ids;
}
