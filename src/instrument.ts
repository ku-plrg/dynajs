import {
  DYNAJS_VAR,
  NO_INSTRUMENT,
} from './constants';
import { AnyNode, Node } from 'acorn';
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
    this.instrumentedPath = options.instrumentedPath ?? '';
    this.originalPath = options.originalPath ?? '';
    this.detail = options.detail ?? false;
  }

  // wrap
  wrap(body: () => void): void {
    this.indentLevel++;
    body();
    this.indentLevel--;
  }

  // write with newline
  writeln(str: string): void {
    this.write(this.indent.repeat(this.indentLevel));
    this.write(str);
    this.write(this.lineEnd);
  }

  // walk the AST nodes in an array recursively
  walk(node: Node): void {
    // @ts-ignore
    visitors[node.type](node, this);
  }

  // walk the AST nodes in an array recursively with newline
  walkln(node: Node): void {
    this.write(this.indent.repeat(this.indentLevel));
    this.walk(node);
    this.write(this.lineEnd);
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

  logExpression(expr: Node): void {
    this.write(`${LOG_EXPRESSION}(${newId(expr)}, `);
    this.walk(expr);
    this.write(')');
  }

  logLiteral(literal: Node, literalType: number): void {
    const code = generate(literal)
    this.write(`${LOG_LITERAL}(${newId(literal)}, ${code}, ${literalType})`);
  }

  logBinaryOp(expr: Node): void {
    const { left, right, operator } = expr as any;
    this.write(`${LOG_BINARY_OP}(${newId(expr)}, "${operator}", `);
    this.walk(left);
    this.write(', ');
    this.walk(right);
    this.write(')');
  }

  logUnaryOp(expr: Node): void {
    const { argument, operator } = expr as any;
    this.write(`${LOG_UNARY_OP}(${newId(expr)}, "${operator}", `);
    this.walk(argument);
    this.write(')');
  }

  logException(program: Node): void {
    this.writeln(`${LOG_EXCEPTION}(${newId(program)}, ${EXCEPTION_VAR});`);
  }

  logScriptEntry(program: Node): void {
    const { instrumentedPath: i, originalPath: o } = this;
    this.writeln(`${LOG_SCRIPT_ENTRY}(${newId(program)}, "${i}", "${o}");`);
  }

  logScriptExit(program: Node): void {
    this.writeln(`${LOG_SCRIPT_EXIT}(${newId(program)});`);
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
// logging function names
// -----------------------------------------------------------------------------
const LOG_LITERAL = DYNAJS_VAR + '.L';
const LOG_EXPRESSION = DYNAJS_VAR + '.E';
const LOG_BINARY_OP = DYNAJS_VAR + '.B';
const LOG_UNARY_OP = DYNAJS_VAR + '.U';
const LOG_EXCEPTION = DYNAJS_VAR + '.X';
const LOG_SCRIPT_ENTRY = DYNAJS_VAR + '.Se';
const LOG_SCRIPT_EXIT = DYNAJS_VAR + '.Sx';

// exception variable name
const EXCEPTION_VAR = DYNAJS_VAR + 'e';

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
    const { name } = node;
    state.write(name);
  },
  Literal: (node, state) => {
    const { value } = node;
    const type = typeof value;
    const litType = type === 'object'
      ? value === null
        ? LITERAL_TYPE_NULL
        : LITERAL_TYPE_REGEXP
      : LITERAL_TYPES[type];
    state.logLiteral(node, litType);
  },
  Program: (node, state) => {
    const { body } = node;
    state.writeln('try {');
    state.wrap(() => {
      state.logScriptEntry(node);
      for (const statement of body) {
        state.walkln(statement);
      }
    });
    state.writeln(`} catch (${EXCEPTION_VAR}) {`);
    state.wrap(() => {
      state.logException(node);
    });
    state.writeln(`} finally {`);
    state.wrap(() => {
      state.logScriptExit(node);
    });
    state.writeln(`}`);
  },
  ExpressionStatement: (node, state) => {
    const { expression } = node;
    state.logExpression(expression);
    state.write(";");
  },
  BlockStatement: (node, state) => {
    todo('BlockStatement');
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
    state.write(kind + ' ');
    state.walkArray(declarations);
    state.write(';');
  },
  VariableDeclarator: (node, state) => {
    const { id, init } = node;
    state.walk(id);
    if (init != null) {
      state.write(' = ');
      state.walk(init);
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
    state.logUnaryOp(node);
  },
  UpdateExpression: (node, state) => {
    todo('UpdateExpression');
  },
  BinaryExpression: (node, state) => {
    state.logBinaryOp(node);
  },
  AssignmentExpression: (node, state) => {
    todo('AssignmentExpression');
  },
  LogicalExpression: (node, state) => {
    todo('LogicalExpression');
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
    todo('SequenceExpression');
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
    todo('ParenthesizedExpression');
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
