import * as LOG from './constant.js';
import * as write from './write.js';
import type * as acorn from 'acorn';
import type { RecursiveVisitors } from 'acorn-walk';
import type { State } from './state.js';
import { VarKind, log, header } from '../utils.js';
import { generate } from 'astring';
import { EXCEPTION_VAR } from '../constant.js';

// -----------------------------------------------------------------------------
// visitors
// -----------------------------------------------------------------------------
export const visitors: RecursiveVisitors<State> = {
  Identifier: (node, state) => {
    if (state.isLHS) {
      state.write(node.name);
    } else {
      write.logRead(state, node, node.name);
    }
  },
  Literal: (node, state) => {
    const { value } = node;
    write.logLiteral(state, node);
  },
  Program: (node, state) => {
    const { body, sourceType } = node;
    if (state.verbose) log(`Instrumenting ${sourceType}...`);
    const strict = state.isStrict || write.hasUseStrictDirective(body);
    state.withStrictMode(strict, () => {
      state.withScope(
        (scope) => scope.walkArray(body),
        () => {
          switch (sourceType) {
            case 'script':
              visitorHelper.Script(node, state);
              break;
            case 'module':
              visitorHelper.Module(node, state);
              break;
          }
        },
      );
    });
  },
  ExpressionStatement: (node, state) => {
    write.logExpression(state, node.expression);
    state.write(';');
  },
  BlockStatement: (node, state) => {
    const { body } = node;
    state.write('{');
    state.withScope(
      (scope) => scope.walkArray(body),
      () => {
        state.wrap(() => {
          write.logDeclare(state, node);
          for (const statement of body) {
            state.writeln('');
            state.walk(statement);
          }
        });
      },
      true,
    );
    // should not add semicolon after block statement if it's followed by else or catch or finally
    state.write('} ');
  },
  EmptyStatement: (node, state) => {
    state.write(';');
  },
  DebuggerStatement: (node, state) => {
    state.write('debugger;');
  },
  WithStatement: (node, state) => {
    const { object, body } = node;
    state.write('with (');
    state.walk(object);
    state.write(') ');
    state.walk(body);
    state.write(' ');
  },
  ReturnStatement: (node, state) => {
    const { argument } = node;
    write.logReturn(state, node, () => {
      if (argument) write.logExpression(state, argument);
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
    state.write(';');
  },
  ContinueStatement: (node, state) => {
    const { label } = node;
    state.write('continue');
    if (label != null) {
      state.write(` ${label.name}`);
    }
    state.write(';');
  },
  IfStatement: (node, state) => {
    const { test, consequent, alternate } = node;
    state.write('if (');
    write.logCondition(state, test, 'if', true);
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
    write.logSwitchLeft(state, discriminant);
    state.write(') {');
    state.withScope(
      (scope) => scope.walkArray(cases),
      () => {
        state.wrap(() => {
          for (const switchCase of cases) {
            state.writeln('');
            state.walk(switchCase);
          }
        });
      },
      true,
    );
    state.writeln('}');
  },
  SwitchCase: (node, state) => {
    const { test, consequent } = node;
    if (test != null) {
      state.write('case ');
      write.logSwitchRight(state, test);
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
    write.logThrow(state, argument);
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
    state.write('catch ');
    state.withScope(
      (scope) => scope.walkCatch(node),
      () => {
        if (param != null) {
          state.write('(');
          state.withLHS(() => state.walk(param));
          state.write(') {');
          state.wrap(() => {
            state.writeln(`${LOG.CATCH_ENTER}();`);
            write.logDeclare(state, node);
            state.writeln('');
            state.walk(body);
          });
          state.writeln('}');
        } else {
          state.walk(body);
        }
      },
    );
  },
  WhileStatement: (node, state) => {
    const { test, body } = node;
    state.write('while (');
    write.logCondition(state, test, 'while', true);
    state.write(') ');
    state.walk(body);
  },
  DoWhileStatement: (node, state) => {
    const { test, body } = node;
    state.write('do ');
    state.walk(body);
    state.write(' while (');
    write.logCondition(state, test, 'do-while', true);
    state.write(');');
  },
  ForStatement: (node, state) => {
    const { init, test, update, body } = node;
    // handle lexical declarations in for-loop initializer
    if (
      init != null &&
      init.type === 'VariableDeclaration' &&
      (init.kind === 'let' || init.kind === 'const')
    ) {
      state.withScope(
        (scope) => scope.walk(init),
        () => {
          head();
          emitLexicalForBody(init);
        },
        true,
      );
    } else {
      // normal for-loop
      head();
      state.walk(body);
    }
    function head() {
      state.write('for (');
      if (init != null) {
        if (init.type === 'VariableDeclaration') {
          state.walk(init);
          state.write(' ');
        } else {
          write.logExpression(state, init);
          state.write('; ');
        }
      } else {
        state.write('; ');
      }
      if (test != null) write.logCondition(state, test, 'for', true);
      state.write('; ');
      if (update != null) write.logExpression(state, update);
      state.write(') ');
    }

    function emitLexicalForBody(
      decl: Extract<typeof init, { type: 'VariableDeclaration' }>,
    ) {
      state.write('{');
      state.wrap(() => {
        write.logDeclare(state, decl);
        if (body.type === 'BlockStatement') {
          for (const statement of body.body) {
            state.writeln('');
            state.walk(statement);
          }
        } else {
          state.writeln('');
          state.walk(body);
        }
      });
      state.writeln('}');
    }
  },
  ForInStatement: (node, state) => {
    write.logForInOfStatement(state, node, true, false);
  },
  FunctionDeclaration: (node, state) => {
    if (
      state.partial.declare &&
      state.scope?.isLexicalScope() &&
      node.id != null
    ) {
      state.writeln(
        `${LOG.DECLARE}(${write.newId(node)}, "${node.id.name}", ${VarKind.Func}, false);`,
      );
    }
    write.logFuncDeclare(state, node, false);
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
      write.logWrite(state, id, init, () => write.logExpression(state, init));
    }
  },
  ThisExpression: (node, state) => {
    write.logRead(state, node, 'this');
  },
  ArrayExpression: (node, state) => {
    write.logLiteral(state, node, () => {
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
    write.logLiteral(state, node, () => {
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
      const func = value as acorn.Function;
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
      write.logFuncTail(state, value as acorn.Function, true, false);
    } else if (kind === 'init') {
      state.write(': ');
      state.walk(value);
    } else {
      // kind is 'get' or 'set'
      write.logFuncTail(state, value as acorn.Function, true, false);
    }
  },
  FunctionExpression: (node, state) => {
    write.logLiteral(state, node, () => {
      write.logFuncDeclare(state, node, true);
    });
  },
  UnaryExpression: (node, state) => {
    write.logUnaryOp(state, node);
  },
  UpdateExpression: (node, state) => {
    write.logUpdateOp(state, node);
  },
  BinaryExpression: (node, state) => {
    write.logBinaryOp(state, node);
  },
  AssignmentExpression: (node, state) => {
    const { left, right, operator } = node;
    const enabled = true; // set to true for now; additional parenthesis is needed
    if (enabled) state.write('(');
    switch (operator) {
      case '=': {
        write.logWrite(state, left, right, () => state.walk(right));
        break;
      }
      default: {
        write.writeCompoundAssignmentValue(state, node);
      }
    }
    if (enabled) state.write(')');
  },
  LogicalExpression: (node, state) => {
    const { left, right, operator } = node;
    const isDisabled = true; // set to true for now; additional parenthesis is needed
    if (isDisabled) state.write('(');
    write.logCondition(state, left, operator);
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
      const { object, property, computed, optional } =
        node as acorn.MemberExpression;
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
        state.write(
          optional
            ? `?.#${(property as any).name}`
            : `.#${(property as any).name}`,
        );
      }
      return;
    }
    write.logGetField(state, node);
  },
  ConditionalExpression: (node, state) => {
    const { test, consequent, alternate } = node;
    state.write('(');
    write.logCondition(state, test, '?');
    state.write(' ? ');
    state.walk(consequent);
    state.write(' : ');
    state.walk(alternate);
    state.write(')');
  },
  CallExpression: (node, state) => {
    const { callee, arguments: args, optional } = node;
    const isDirectEval =
      !optional &&
      callee.type === 'Identifier' &&
      (callee as acorn.Identifier).name === 'eval';
    write.logCall(state, callee, false, optional);
    // TODO fix optional chain issue
    state.write(optional && !state.partial.F ? '?.(' : '(');
    if (isDirectEval && state.partial.Ev && args.length >= 1) {
      state.write(`${LOG.EVAL_CODE}(${write.newId(node)}, `);
      state.walk(args[0]);
      state.write(', true)');
      if (args.length > 1) {
        state.write(', ');
        state.walkArray(args.slice(1));
      }
    } else {
      state.walkArray(args);
    }
    state.write(')');
  },
  NewExpression: (node, state) => {
    const { callee, arguments: args } = node;
    write.logCall(state, callee, true, false);
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
    write.logForInOfStatement(state, node, false, node.await);
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
    write.logLiteral(state, node, () => {
      write.logArrowFuncDeclare(state, node);
    });
  },
  YieldExpression: (node, state) => {
    write.logYield(state, node, node.argument, node.delegate);
  },
  TemplateLiteral: (node, state) => {
    // rewrite `a${x}b${y}c` as D$.TL(id2, D$.TL(id1, "a", x, "b"), y, "c")
    const { quasis, expressions } = node;
    const length = expressions.length;

    if (length === 0) {
      write.writeQuasiLiteral(
        state,
        node,
        quasis[0].value.cooked ?? quasis[0].value.raw,
      );
      return;
    }

    // open outer-to-inner `D$.TL(id, ` wrappers; IDs are allocated outermost-first
    for (let i = 0; i < length; i++) {
      state.write(`${LOG.TEMPLATE_LITERAL}(${write.newId(node)}, `);
    }
    write.writeQuasiLiteral(
      state,
      node,
      quasis[0].value.cooked ?? quasis[0].value.raw,
    );
    for (let i = 0; i < length; i++) {
      state.write(', ');
      state.walk(expressions[i]);
      state.write(', ');
      write.writeQuasiLiteral(
        state,
        node,
        quasis[i + 1].value.cooked ?? quasis[i + 1].value.raw,
      );
      state.write(')');
    }
  },
  TaggedTemplateExpression: (node, state) => {
    write.logTaggedCall(state, node.tag);
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
    const { properties } = node as { properties: acorn.Node[] };
    state.write('{');
    for (let i = 0; i < properties.length; i++) {
      if (i > 0) state.write(', ');
      state.walk(properties[i]);
    }
    state.write('}');
  },
  ArrayPattern: (node, state) => {
    const { elements } = node as { elements: acorn.Node[] };
    state.write('[');
    for (let i = 0; i < elements.length; i++) {
      if (i > 0) state.write(', ');
      const elem = elements[i];
      if (elem != null) state.walk(elem);
      else if (i === elements.length - 1) state.write(',');
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
    write.logExpression(state, node.right as acorn.Expression);
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
      } else if (key.type === 'Literal') {
        state.write(generate(key));
      } else {
        state.withLHS(() => state.walk(key));
      }
    }
    const isDerivedConstructor = kind === 'constructor' && state.inDerivedClass;
    if (isDerivedConstructor) state.isDerivedConstructor = true;
    write.logFuncTail(state, value, true, false);
    if (isDerivedConstructor) state.isDerivedConstructor = false;
  },
  ClassDeclaration: (node, state) => {
    write.logClassDeclare(state, node, false);
  },
  ClassExpression: (node, state) => {
    write.logLiteral(state, node, () => {
      write.logClassDeclare(state, node, true);
    });
  },
  MetaProperty: (node, state) => {
    const name = `${node.meta.name}.${node.property.name}`;
    write.logRead(state, node, name);
  },
  ImportDeclaration: (node, state) => {
    state.write('import');
    if (node.specifiers.length > 0) {
      state.write(' ');
      write.writeImportClause(state, node.specifiers);
      state.write(' from ');
    } else {
      state.write(' ');
    }
    write.writeNodeAsSource(state, node.source);
    write.writeImportAttributes(state, (node as any).attributes);
    state.write(';');
  },
  ImportSpecifier: (node, state) => {
    write.writeNodeAsSource(state, node.imported);
    if (node.local.name !== (node.imported as any).name) {
      state.write(` as ${node.local.name}`);
    }
  },
  ImportDefaultSpecifier: (node, state) => {
    state.write(node.local.name);
  },
  ImportNamespaceSpecifier: (node, state) => {
    state.write(`* as ${node.local.name}`);
  },
  ImportAttribute: (node, state) => {
    write.writeNodeAsSource(state, node.key);
    state.write(': ');
    write.writeNodeAsSource(state, node.value);
  },
  ExportNamedDeclaration: (node, state) => {
    state.write('export ');
    if (node.declaration) {
      state.walk(node.declaration);
      return;
    }
    write.writeExportSpecifiers(state, node.specifiers);
    if (node.source) {
      state.write(' from ');
      write.writeNodeAsSource(state, node.source);
      write.writeImportAttributes(state, (node as any).attributes);
    }
    state.write(';');
  },
  ExportSpecifier: (node, state) => {
    write.writeNodeAsSource(state, node.local);
    const localName = (node.local as any).name ?? (node.local as any).value;
    const exportedName =
      (node.exported as any).name ?? (node.exported as any).value;
    if (localName !== exportedName) {
      state.write(' as ');
      write.writeNodeAsSource(state, node.exported);
    }
  },
  ExportDefaultDeclaration: (node, state) => {
    state.write('export default ');
    const decl = node.declaration as acorn.Node;
    state.walk(decl);
    if (
      decl.type !== 'FunctionDeclaration' &&
      decl.type !== 'ClassDeclaration'
    ) {
      state.write(';');
    }
  },
  ExportAllDeclaration: (node, state) => {
    state.write('export *');
    if ((node as any).exported) {
      state.write(' as ');
      write.writeNodeAsSource(state, (node as any).exported);
    }
    state.write(' from ');
    write.writeNodeAsSource(state, node.source);
    write.writeImportAttributes(state, (node as any).attributes);
    state.write(';');
  },
  AwaitExpression: (node, state) => {
    write.logAwait(state, node, node.argument);
  },
  ChainExpression: (node, state) => {
    if (!write.needsChainBoundary(state, node.expression)) {
      state.walk(node.expression);
      return;
    }
    state.write(`${LOG.CHAIN}(`);
    state.walk(node.expression);
    state.write(')');
  },
  ImportExpression: (node, state) => {
    state.write('import(');
    write.logExpression(state, (node as any).source);
    if ((node as any).options) {
      state.write(', ');
      write.logExpression(state, (node as any).options);
    }
    state.write(')');
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
    } else if (key.type === 'Literal') {
      state.write(generate(key));
    } else {
      state.withLHS(() => state.walk(key));
    }

    if (!state.partial.Fi && !computed) {
      if (value) {
        state.write(' = ');
        state.walk(value);
      }
      state.write(';');
      return;
    }

    const id = write.newId(node);
    state.write(` = ${LOG.FIELD_INIT}(${id}, this, `);
    if (computed) {
      state.walk(key);
    } else if (key.type === 'PrivateIdentifier') {
      state.write(`"#${(key as any).name}"`);
    } else {
      state.write(`"${(key as acorn.Identifier).name}"`);
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
    state.write('static {');
    state.withScope(
      (scope) => scope.walkArray(body),
      () => {
        state.wrap(() => {
          write.logDeclare(state, node);
          for (const statement of body) {
            state.writeln('');
            state.walk(statement);
          }
        });
      },
    );
    state.writeln('}');
  },
};

type TopLevelBodyNode = acorn.Statement | acorn.ModuleDeclaration;
type TopLevelBodyChunk =
  | { kind: 'statement'; nodes: acorn.Statement[] }
  | { kind: 'declaration' | 'moduleDeclaration'; node: TopLevelBodyNode };

function isTopLevelModuleDeclaration(
  node: TopLevelBodyNode,
): node is acorn.ModuleDeclaration {
  switch (node.type) {
    case 'ImportDeclaration':
    case 'ExportNamedDeclaration':
    case 'ExportDefaultDeclaration':
    case 'ExportAllDeclaration':
      return true;
    default:
      return false;
  }
}

function isTopLevelDeclaration(
  node: TopLevelBodyNode,
): node is
  | acorn.VariableDeclaration
  | acorn.FunctionDeclaration
  | acorn.ClassDeclaration {
  switch (node.type) {
    case 'VariableDeclaration':
    case 'FunctionDeclaration':
    case 'ClassDeclaration':
      return true;
    default:
      return false;
  }
}

function splitTopLevelBody(
  body: readonly TopLevelBodyNode[],
): TopLevelBodyChunk[] {
  const chunks: TopLevelBodyChunk[] = [];
  let statements: acorn.Statement[] = [];

  const flushStatements = (): void => {
    if (statements.length === 0) return;
    chunks.push({ kind: 'statement', nodes: statements });
    statements = [];
  };

  for (const node of body) {
    if (isTopLevelModuleDeclaration(node)) {
      flushStatements();
      chunks.push({ kind: 'moduleDeclaration', node });
      continue;
    }
    if (isTopLevelDeclaration(node)) {
      flushStatements();
      chunks.push({ kind: 'declaration', node });
      continue;
    }
    statements.push(node);
  }

  flushStatements();
  return chunks;
}

function writeModuleDeclarationChunk(
  node: TopLevelBodyNode,
  program: acorn.Program,
  state: State,
): void {
  switch (node.type) {
    case 'VariableDeclaration':
      writeModuleVariableDeclaration(node, program, state);
      return;
    case 'FunctionDeclaration':
    case 'ClassDeclaration':
    case 'ImportDeclaration':
    case 'ExportAllDeclaration':
      state.walk(node);
      return;
    case 'ExportNamedDeclaration':
      state.write('export ');
      if (node.declaration) {
        writeModuleDeclarationChunk(
          node.declaration as TopLevelBodyNode,
          program,
          state,
        );
        return;
      }
      write.writeExportSpecifiers(state, node.specifiers);
      if (node.source) {
        state.write(' from ');
        write.writeNodeAsSource(state, node.source);
        write.writeImportAttributes(state, (node as any).attributes);
      }
      state.write(';');
      return;
    case 'ExportDefaultDeclaration': {
      state.write('export default ');
      const decl = node.declaration as acorn.Node;
      if (
        decl.type === 'FunctionDeclaration' ||
        decl.type === 'ClassDeclaration'
      ) {
        state.walk(decl);
      } else {
        writeModuleWrappedExpression(decl as acorn.Expression, program, state);
        state.write(';');
      }
      return;
    }
    default:
      state.walk(node);
  }
}

function writeModuleVariableDeclaration(
  node: acorn.VariableDeclaration,
  program: acorn.Program,
  state: State,
): void {
  state.write(node.kind + ' ');
  for (let i = 0; i < node.declarations.length; i++) {
    if (i > 0) state.write(', ');
    writeModuleVariableDeclarator(node.declarations[i], program, state);
  }
  state.write(';');
}

function writeModuleVariableDeclarator(
  node: acorn.VariableDeclarator,
  program: acorn.Program,
  state: State,
): void {
  const { id, init } = node;
  if (init == null) {
    state.withLHS(() => state.walk(id));
    return;
  }
  write.logWrite(state, id, init, () =>
    writeModuleWrappedExpression(init as acorn.Expression, program, state),
  );
}

function writeModuleWrappedExpression(
  expression: acorn.Expression,
  program: acorn.Program,
  state: State,
): void {
  const isAwait = expression.type === 'AwaitExpression';
  const awaitExpression = isAwait
    ? (expression as acorn.AwaitExpression)
    : null;
  if (isAwait) {
    state.write(
      `${LOG.AWAIT_RESULT}(${write.newId(expression)}, await ${LOG.AWAIT}(${write.newId(expression)}, `,
    );
  }
  state.write('(');
  if (isAwait) state.write('async');
  state.write('() => {');
  state.wrap(() => {
    state.writeln('try {');
    state.wrap(() => {
      state.writeln('return ');
      write.logExpression(
        state,
        isAwait ? awaitExpression!.argument : expression,
      );
      state.write(';');
    });
    state.writeln(`} catch (${EXCEPTION_VAR}) {`);
    state.wrap(() => {
      write.logException(state, program);
      state.writeln(`throw ${EXCEPTION_VAR};`);
    });
    state.writeln('}');
  });
  state.writeln('})()');
  if (isAwait) state.write('))');
}

/**
 * not a `Visitor` in the sense of `acorn-walk`.
 * a collection of helper functions for visiting certain nodes, to avoid code duplication in the main visitors
 */
const visitorHelper = {
  Script: (node: acorn.Program, state: State) => {
    const useThrow = state.partial.shouldWrapThrow;
    const { body } = node;
    if (useThrow) state.writeln('try {');
    state.wrap(() => {
      write.logScriptEnter(state, node);
      write.logDeclare(state, node);
      for (const statement of body) {
        state.writeln('');
        state.walk(statement);
      }
    });
    if (useThrow) state.writeln(`} catch (${EXCEPTION_VAR}) {`);
    if (useThrow)
      state.wrap(() => {
        write.logException(state, node);
      });
    if (useThrow) state.writeln(`} finally {`);
    if (useThrow)
      state.wrap(() => {
        write.logScriptExit(state, node);
      });
    if (useThrow) state.writeln(`}`);
  },
  Module: (node: acorn.Program, state: State) => {
    const { body } = node;
    const chunks = splitTopLevelBody(body);
    const useThrow = state.partial.shouldWrapThrow;
    write.logScriptEnter(state, node);
    write.logDeclare(state, node);

    if (state.verbose) {
      log(
        `Module body is split into ${chunks.length} chunk(s) for separate try-catch instrumentation.`,
      );
      header('Chunks:');
      chunks.forEach((chunk, index) => {
        log(
          `Chunk ${index + 1}: kind = ${chunk.kind}, nodes = [${chunk.kind === 'statement' ? chunk.nodes.map((n) => n.type).join(', ') : chunk.node.type}]`,
        );
      });
      header('Chunk End');
    }

    for (const chunk of chunks) {
      state.writeln('');

      if (chunk.kind !== 'statement') {
        writeModuleDeclarationChunk(chunk.node, node, state);
        continue;
      }

      if (useThrow) state.writeln('try {');
      state.wrap(() => {
        for (const statement of chunk.nodes) {
          state.writeln('');
          if (statement.type === 'ExpressionStatement') {
            // Track every top-level ExpressionStatement through Lcs so the
            // script's completion value survives through the trailing Sx/Lcv
            // statements, matching the value `eval(userCode)` would return.
            state.write(`${LOG.LCV_SET}(`);
            write.logExpression(state, statement.expression);
            state.write(');');
          } else {
            state.walk(statement);
          }
        }
      });
      if (useThrow) state.writeln(`} catch (${EXCEPTION_VAR}) {`);
      if (useThrow)
        state.wrap(() => {
          write.logException(state, node);
        });
      if (useThrow) state.writeln(`}`);
    }

    write.logScriptExit(state, node);
    // Final statement: evaluates to `lastComputedValue`, giving callers of
    // `eval(...)` / `new Function(...)` the user's completion value.
    state.writeln('');
    state.write(`${LOG.LCV_GET}();`);
  },
};
