import { DYNAJS_VAR } from './constants';
import { AnyNode, Node } from 'acorn';
import { generate } from 'astring';
import {
  header,
  log,
  parse,
  stringify,
  todo,
  warn,
} from './utils';

// return the instrumented code
export function instrument(code: string, options: Options = {}): string {
  if (options.detail) header('Instrumenting the code...');
  const ast = parse(code);
  const state = new State(options);
  if (options.detail) log(stringify(ast));
  state.walk(ast);
  if (options.detail) log(state.output.trim());
  return state.output;
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
    this.detail = options.detail ?? false;
  }

  // walk the AST nodes in an array recursively
  walk(node: Node): void {
    // @ts-ignore
    visitors[node.type](node, this);
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

  logLiteral(lit: Node, litType: number): void {
    const code = generate(lit)
    this.write(`${LOG_LITERAL}(${newId()}, ${code}, ${litType})`);
  }

  logExpression(expr: Node): void {
    this.write(`${LOG_EXPRESSION}(${newId()}, `);
    this.walk(expr);
    this.write(')');
  }
}

// state options
interface Options {
  write?: (str: string) => void
  indent?: string
  lineEnd?: string
  detail?: boolean
}

// -----------------------------------------------------------------------------
// logging function names
// -----------------------------------------------------------------------------
const LOG_LITERAL = DYNAJS_VAR + ".T";
const LOG_EXPRESSION = DYNAJS_VAR + ".X";

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
  "string": LITERAL_TYPE_STRING,
  "boolean": LITERAL_TYPE_BOOLEAN,
  "null": LITERAL_TYPE_NULL,
  "number": LITERAL_TYPE_NUMBER,
  "regexp": LITERAL_TYPE_REGEXP,
  "bigint": LITERAL_TYPE_BIGINT,
}

// -----------------------------------------------------------------------------
// unique id generator
// -----------------------------------------------------------------------------
const ID_INC_STEP = 1;
let id = 0;
function newId(): number {
  var tmpid = id;
  id = id + ID_INC_STEP;
  return tmpid;
}

// -----------------------------------------------------------------------------
// visitors
// -----------------------------------------------------------------------------
type Visitors = {
  [type in AnyNode["type"]]?:
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
    const litType = type === "object" ?
        (value === null ? LITERAL_TYPE_NULL : LITERAL_TYPE_REGEXP) :
        LITERAL_TYPES[type];
    state.logLiteral(node, litType);
  },
  Program: (node, state) => {
    const { indentLevel, lineEnd } = state;
    const indent = state.indent.repeat(indentLevel);
    const { body } = node;
    for (const statement of body) {
      state.write(indent);
      state.walk(statement);
      state.write(lineEnd);
    }
  },
  ExpressionStatement: (node, state) => {
    const { expression } = node;
    state.logExpression(expression);
  },
  BlockStatement: (node, state) => {
    todo("BlockStatement");
  },
  EmptyStatement: (node, state) => {
    todo("EmptyStatement");
  },
  DebuggerStatement: (node, state) => {
    todo("DebuggerStatement");
  },
  WithStatement: (node, state) => {
    todo("WithStatement");
  },
  ReturnStatement: (node, state) => {
    todo("ReturnStatement");
  },
  LabeledStatement: (node, state) => {
    todo("LabeledStatement");
  },
  BreakStatement: (node, state) => {
    todo("BreakStatement");
  },
  ContinueStatement: (node, state) => {
    todo("ContinueStatement");
  },
  IfStatement: (node, state) => {
    todo("IfStatement");
  },
  SwitchStatement: (node, state) => {
    todo("SwitchStatement");
  },
  SwitchCase: (node, state) => {
    todo("SwitchCase");
  },
  ThrowStatement: (node, state) => {
    todo("ThrowStatement");
  },
  TryStatement: (node, state) => {
    todo("TryStatement");
  },
  CatchClause: (node, state) => {
    todo("CatchClause");
  },
  WhileStatement: (node, state) => {
    todo("WhileStatement");
  },
  DoWhileStatement: (node, state) => {
    todo("DoWhileStatement");
  },
  ForStatement: (node, state) => {
    todo("ForStatement");
  },
  ForInStatement: (node, state) => {
    todo("ForInStatement");
  },
  FunctionDeclaration: (node, state) => {
    todo("FunctionDeclaration");
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
    todo("ThisExpression");
  },
  ArrayExpression: (node, state) => {
    todo("ArrayExpression");
  },
  ObjectExpression: (node, state) => {
    todo("ObjectExpression");
  },
  Property: (node, state) => {
    todo("Property");
  },
  FunctionExpression: (node, state) => {
    todo("FunctionExpression");
  },
  UnaryExpression: (node, state) => {
    todo("UnaryExpression");
  },
  UpdateExpression: (node, state) => {
    todo("UpdateExpression");
  },
  BinaryExpression: (node, state) => {
    todo("BinaryExpression");
  },
  AssignmentExpression: (node, state) => {
    todo("AssignmentExpression");
  },
  LogicalExpression: (node, state) => {
    todo("LogicalExpression");
  },
  MemberExpression: (node, state) => {
    todo("MemberExpression");
  },
  ConditionalExpression: (node, state) => {
    todo("ConditionalExpression");
  },
  CallExpression: (node, state) => {
    todo("CallExpression");
  },
  NewExpression: (node, state) => {
    todo("NewExpression");
  },
  SequenceExpression: (node, state) => {
    todo("SequenceExpression");
  },
  ForOfStatement: (node, state) => {
    todo("ForOfStatement");
  },
  Super: (node, state) => {
    todo("Super");
  },
  SpreadElement: (node, state) => {
    todo("SpreadElement");
  },
  ArrowFunctionExpression: (node, state) => {
    todo("ArrowFunctionExpression");
  },
  YieldExpression: (node, state) => {
    todo("YieldExpression");
  },
  TemplateLiteral: (node, state) => {
    todo("TemplateLiteral");
  },
  TaggedTemplateExpression: (node, state) => {
    todo("TaggedTemplateExpression");
  },
  TemplateElement: (node, state) => {
    todo("TemplateElement");
  },
  ObjectPattern: (node, state) => {
    todo("ObjectPattern");
  },
  ArrayPattern: (node, state) => {
    todo("ArrayPattern");
  },
  RestElement: (node, state) => {
    todo("RestElement");
  },
  AssignmentPattern: (node, state) => {
    todo("AssignmentPattern");
  },
  ClassBody: (node, state) => {
    todo("ClassBody");
  },
  MethodDefinition: (node, state) => {
    todo("MethodDefinition");
  },
  ClassDeclaration: (node, state) => {
    todo("ClassDeclaration");
  },
  ClassExpression: (node, state) => {
    todo("ClassExpression");
  },
  MetaProperty: (node, state) => {
    todo("MetaProperty");
  },
  ImportDeclaration: (node, state) => {
    todo("ImportDeclaration");
  },
  ImportSpecifier: (node, state) => {
    todo("ImportSpecifier");
  },
  ImportDefaultSpecifier: (node, state) => {
    todo("ImportDefaultSpecifier");
  },
  ImportNamespaceSpecifier: (node, state) => {
    todo("ImportNamespaceSpecifier");
  },
  ImportAttribute: (node, state) => {
    todo("ImportAttribute");
  },
  ExportNamedDeclaration: (node, state) => {
    todo("ExportNamedDeclaration");
  },
  ExportSpecifier: (node, state) => {
    todo("ExportSpecifier");
  },
  ExportDefaultDeclaration: (node, state) => {
    todo("ExportDefaultDeclaration");
  },
  ExportAllDeclaration: (node, state) => {
    todo("ExportAllDeclaration");
  },
  AwaitExpression: (node, state) => {
    todo("AwaitExpression");
  },
  ChainExpression: (node, state) => {
    todo("ChainExpression");
  },
  ImportExpression: (node, state) => {
    todo("ImportExpression");
  },
  ParenthesizedExpression: (node, state) => {
    todo("ParenthesizedExpression");
  },
  PropertyDefinition: (node, state) => {
    todo("PropertyDefinition");
  },
  PrivateIdentifier: (node, state) => {
    todo("PrivateIdentifier");
  },
  StaticBlock: (node, state) => {
    todo("StaticBlock");
  },
}
