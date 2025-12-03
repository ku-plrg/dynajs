import {
  DYNAJS_VAR,
  EXCEPTION_VAR,
  NO_INSTRUMENT,
} from './constants';
import {
  AnyNode,
  Node,
  Expression,
  BinaryExpression,
  UnaryExpression,
  LogicalExpression,
  Pattern,
  Identifier,
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
  scope?: Scope;
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
    this.isLHS = false;
    this.instrumentedPath = options.instrumentedPath ?? '';
    this.originalPath = options.originalPath ?? '';
    this.detail = options.detail ?? false;
  }

  // execute body with isLHS = truej 
  withLHS<T>(body: () => T): T {
    const prev = this.isLHS;
    this.isLHS = true;
    const result = body();
    this.isLHS = prev;
    return result;
  }

  // update scope
  updateScope(body: (scope: Scope) => void): void {
    const scope = new Scope(this.scope);
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
  parent?: Scope;

  constructor(parent?: Scope) {
    this.vars = {};
    this.parent = parent;
  }

  walk(node: Node, forVar: boolean): void {
    const visitors = forVar ? Scope.varVisitors : Scope.lexicalVisitors;
    recursive(node, this, visitors);
  }

  walkArray(nodes: Node[], forVar: boolean): void {
    for (const node of nodes) {
      this.walk(node, forVar);
    }
  }

  static varVisitors: RecursiveVisitors<Scope> = {
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
    FunctionDeclaration: (node, scope, c) => {},
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
const LOG_EXPRESSION = DYNAJS_VAR + '.E';
const LOG_BINARY_OP = DYNAJS_VAR + '.B';
const LOG_UNARY_OP = DYNAJS_VAR + '.U';
const LOG_CONDITION = DYNAJS_VAR + '.C';
const LOG_DECLARE = DYNAJS_VAR + '.D';
const LOG_READ = DYNAJS_VAR + '.R';
const LOG_WRITE = DYNAJS_VAR + '.W';
const LOG_LITERAL = DYNAJS_VAR + '.L';
const LOG_EXCEPTION = DYNAJS_VAR + '.X';
const LOG_SCRIPT_ENTRY = DYNAJS_VAR + '.Se';
const LOG_SCRIPT_EXIT = DYNAJS_VAR + '.Sx';

// logging end of an expression
function logExpression(state: State, expr: Expression): void {
  state.write(`${LOG_EXPRESSION}(${newId(expr)}, `);
  state.walk(expr);
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

// logging a logical operation
function logLogicalOp(state: State, expr: LogicalExpression): void {
  const { left, right, operator } = expr;
  state.write(`${LOG_CONDITION}(${newId(expr)}, "${operator}", `);
  state.walk(left);
  state.write(`) ${operator} `);
  state.walk(right);
}

// logging a variable declaration
function logDeclare(state: State, node: Node): void {
  const vars = state.scope?.vars;
  if (!vars) return;
  for (const name in vars) {
    const kind = vars[name];
    state.writeln(`${LOG_DECLARE}(${newId(node)}, "${name}", ${kind});`);
  }
}

// logging a variable read
function logRead(state: State, id: Identifier): void {
  var { name } = id;
  state.write(`${LOG_READ}(${newId(id)}, "${name}", ${name})`);
}

// logging a variable write
function logWrite(state: State, id: Pattern, value: Expression): void {
  state.write(`${LOG_WRITE}(${newId(id)}, `);
  state.write(`[${collectIdentifiers(id).map(x => `"${x}"`).join(', ')}], `);
  logExpression(state, value);
  state.write(')');
}

// logging a literal
function logLiteral(state: State, literal: Node, literalType: number): void {
  const code = generate(literal)
  state.write(`${LOG_LITERAL}(${newId(literal)}, ${code}, ${literalType})`);
}

// logging an exception
function logException(state: State, program: Node): void {
  state.writeln(`${LOG_EXCEPTION}(${newId(program)}, ${EXCEPTION_VAR});`);
}

// logging script entry
function logScriptEntry(state: State, program: Node): void {
  const { instrumentedPath: i, originalPath: o } = state;
  state.writeln(`${LOG_SCRIPT_ENTRY}(${newId(program)}, "${i}", "${o}");`);
}

// logging script exit
function logScriptExit(state: State, program: Node): void {
  state.writeln(`${LOG_SCRIPT_EXIT}(${newId(program)});`);
}

// -----------------------------------------------------------------------------
// literal types
// -----------------------------------------------------------------------------
const LITERAL_TYPE_STRING = 0;
const LITERAL_TYPE_BOOLEAN = 1;
const LITERAL_TYPE_NULL = 2;
const LITERAL_TYPE_NUMBER = 3;
const LITERAL_TYPE_REGEXP = 4;
const LITERAL_TYPE_BIGINT = 5;

const LITERAL_TYPES: { [key: string]: number } = {
  'string': LITERAL_TYPE_STRING,
  'boolean': LITERAL_TYPE_BOOLEAN,
  'null': LITERAL_TYPE_NULL,
  'number': LITERAL_TYPE_NUMBER,
  'bigint': LITERAL_TYPE_BIGINT,
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
      logRead(state, node);
    }
  },
  Literal: (node, state) => {
    const { value } = node;
    const type = typeof value;
    const litType = type === 'object'
      ? value === null
        ? LITERAL_TYPE_NULL
        : LITERAL_TYPE_REGEXP
      : LITERAL_TYPES[type];
    logLiteral(state, node, litType);
  },
  Program: (node, state) => {
    const { body } = node;
    state.updateScope(scope => {
      scope.walkArray(body, true);
      scope.walkArray(body, false);
    });
    state.writeln('try {');
    state.wrap(() => {
      logScriptEntry(state, node);
      logDeclare(state, node);
      for (const statement of body) {
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
    state.writeln('');
    logExpression(state, expression);
    state.write(';');
  },
  BlockStatement: (node, state) => {
    const { body } = node;
    state.updateScope(scope => scope.walkArray(body, false));
    state.writeln('{');
    state.wrap(() => {
      logDeclare(state, node);
      for (const statement of body) {
        state.walk(statement);
      }
    });
    state.writeln('}');
  },
  EmptyStatement: (node, state) => {
    todo('EmptyStatement');
  },
  DebuggerStatement: (node, state) => {
    todo('DebuggerStatement');
  },
  WithStatement: (node, state) => {
    todo('WithStatement');
  },
  ReturnStatement: (node, state) => {
    todo('ReturnStatement');
  },
  LabeledStatement: (node, state) => {
    todo('LabeledStatement');
  },
  BreakStatement: (node, state) => {
    todo('BreakStatement');
  },
  ContinueStatement: (node, state) => {
    todo('ContinueStatement');
  },
  IfStatement: (node, state) => {
    todo('IfStatement');
  },
  SwitchStatement: (node, state) => {
    todo('SwitchStatement');
  },
  SwitchCase: (node, state) => {
    todo('SwitchCase');
  },
  ThrowStatement: (node, state) => {
    todo('ThrowStatement');
  },
  TryStatement: (node, state) => {
    todo('TryStatement');
  },
  CatchClause: (node, state) => {
    todo('CatchClause');
  },
  WhileStatement: (node, state) => {
    todo('WhileStatement');
  },
  DoWhileStatement: (node, state) => {
    todo('DoWhileStatement');
  },
  ForStatement: (node, state) => {
    todo('ForStatement');
  },
  ForInStatement: (node, state) => {
    todo('ForInStatement');
  },
  FunctionDeclaration: (node, state) => {
    todo('FunctionDeclaration');
  },
  VariableDeclaration: (node, state) => {
    const { kind, declarations } = node;
    state.writeln(kind + ' ');
    state.walkArray(declarations);
    state.write(';');
  },
  VariableDeclarator: (node, state) => {
    const { id, init } = node;
    state.withLHS(() => state.walk(id));
    if (init != null) {
      state.write(' = ');
      logWrite(state, id, init);
    }
  },
  ThisExpression: (node, state) => {
    todo('ThisExpression');
  },
  ArrayExpression: (node, state) => {
    todo('ArrayExpression');
  },
  ObjectExpression: (node, state) => {
    todo('ObjectExpression');
  },
  Property: (node, state) => {
    todo('Property');
  },
  FunctionExpression: (node, state) => {
    todo('FunctionExpression');
  },
  UnaryExpression: (node, state) => {
    if (node.operator === 'delete') {
      todo('UnaryExpression: delete');
    }
    logUnaryOp(state, node);
  },
  UpdateExpression: (node, state) => {
    todo('UpdateExpression');
  },
  BinaryExpression: (node, state) => {
    logBinaryOp(state, node);
  },
  AssignmentExpression: (node, state) => {
    todo('AssignmentExpression');
  },
  LogicalExpression: (node, state) => {
    logLogicalOp(state, node);
  },
  MemberExpression: (node, state) => {
    todo('MemberExpression');
  },
  ConditionalExpression: (node, state) => {
    todo('ConditionalExpression');
  },
  CallExpression: (node, state) => {
    todo('CallExpression');
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
    todo('ForOfStatement');
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
function collectIdentifiers(pattern: Pattern): string[] {
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
    }
  }
  collect(pattern);
  return ids;
}
