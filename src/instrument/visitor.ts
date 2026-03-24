import * as LOG from '../constants/hook.js';
import * as l from './log.js';
import type * as acorn from 'acorn';
import type { State } from './state.js';
import { todo, VarKind } from '../utils.js';
import { generate } from 'astring';
import { EXCEPTION_VAR } from '../constants/general.js';

// -----------------------------------------------------------------------------
// visitors
// -----------------------------------------------------------------------------
type Visitors = {
  [type in acorn.AnyNode['type']]?:
    (node: Extract<acorn.AnyNode, { type: type }>, state: State) => void
}

export const visitors: Visitors = {
  Identifier: (node, state) => {
    if (state.isLHS) {
      state.write(node.name);
    } else {
      l.logRead(state, node, node.name);
    }
  },
  Literal: (node, state) => {
    const { value } = node;
    l.logLiteral(state, node);
  },
  Program: (node, state) => {
    const { body } = node;
    const strict = state.isStrict || l.hasUseStrictDirective(body);
    state.withStrictMode(strict, () => {
      state.withScope(scope => scope.walkArray(body), () => {
        const hasModuleDeclaration = body.some(l.isModuleDeclaration);
        if (hasModuleDeclaration) {
          l.logScriptEnter(state, node);
          l.logDeclare(state, node);
          for (const statement of body) {
            state.writeln('');
            state.walk(statement);
          }
          l.logScriptExit(state, node);
          return;
        }
        state.writeln('try {');
        state.wrap(() => {
          l.logScriptEnter(state, node);
          l.logDeclare(state, node);
          for (const statement of body) {
            state.writeln('');
            state.walk(statement);
          }
        });
        state.writeln(`} catch (${EXCEPTION_VAR}) {`);
        state.wrap(() => {
          l.logException(state, node);
        });
        state.writeln(`} finally {`);
        state.wrap(() => {
          l.logScriptExit(state, node);
        });
        state.writeln(`}`);
      });
    });
  },
  ExpressionStatement: (node, state) => {
    l.logExpression(state, node.expression);
    state.write(';');
  },
  BlockStatement: (node, state) => {
    const { body } = node;
    state.write('{');
    state.withScope(scope => scope.walkArray(body), () => {
      state.wrap(() => {
        l.logDeclare(state, node);
        for (const statement of body) {
          state.writeln('');
          state.walk(statement);
        }
      });
    }, true);
    state.write('}');
    state.writeln(';');
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
    const { argument } = node;
    l.logReturn(state, node, () => {
      if (argument) l.logExpression(state, argument);
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
    l.logCondition(state, test, 'if', true);
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
    l.logSwitchLeft(state, discriminant);
    state.write(') {');
    state.withScope(scope => scope.walkArray(cases), () => {
      state.wrap(() => {
        for (const switchCase of cases) {
          state.writeln('');
          state.walk(switchCase);
        }
      });
    }, true);
    state.writeln('}');
  },
  SwitchCase: (node, state) => {
    const { test, consequent } = node;
    if (test != null) {
      state.write('case ');
      l.logSwitchRight(state, test);
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
    l.logThrow(state, argument);
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
    state.withScope(scope => scope.walkCatch(node), () => {
      if (param != null) {
        state.write('(');
        state.withLHS(() => state.walk(param));
        state.write(') {');
        state.wrap(() => {
          state.writeln(`${LOG.CATCH_ENTER}();`);
          l.logDeclare(state, node);
          state.writeln('');
          state.walk(body);
        });
        state.writeln('}');
      } else {
        state.walk(body);
      }
    });
  },
  WhileStatement: (node, state) => {
    const { test, body } = node;
    state.write('while (');
    l.logCondition(state, test, 'while', true);
    state.write(') ');
    state.walk(body);
  },
  DoWhileStatement: (node, state) => {
    const { test, body } = node;
    state.write('do ');
    state.walk(body);
    state.write(' while (');
    l.logCondition(state, test, 'do-while', true);
    state.write(');');
  },
  ForStatement: (node, state) => {
    const { init, test, update, body } = node;
    // handle lexical declarations in for-loop initializer
    if (init != null &&
        init.type === 'VariableDeclaration' &&
        (init.kind === 'let' || init.kind === 'const')) {
      state.withScope(scope => scope.walk(init), () => {
        head();
        emitLexicalForBody(init);
      }, true);
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
          l.logExpression(state, init);
          state.write('; ');
        }
      } else {
        state.write('; ');
      }
      if (test != null) l.logCondition(state, test, 'for', true);
      state.write('; ');
      if (update != null) l.logExpression(state, update);
      state.write(') ');
    }

    function emitLexicalForBody(decl: Extract<typeof init, { type: 'VariableDeclaration' }>) {
      state.write('{');
      state.wrap(() => {
        l.logDeclare(state, decl);
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
    l.logForInOfStatement(state, node, true, false);
  },
  FunctionDeclaration: (node, state) => {
    if (state.isEnabled.D && state.scope?.isLexicalScope() && node.id != null) {
      state.writeln(`${LOG.DECLARE}(${l.newId(node)}, "${node.id.name}", ${VarKind.Func}, false);`);
    }
    l.logFuncDeclare(state, node, false);
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
      l.logWrite(state, id, init, () => l.logExpression(state, init));
    }
  },
  ThisExpression: (node, state) => {
    l.logRead(state, node, 'this');
  },
  ArrayExpression: (node, state) => {
    l.logLiteral(state, node, () => {
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
    l.logLiteral(state, node, () => {
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
      l.logFuncTail(state, value as acorn.Function, true, false);
    } else if (kind === 'init') {
      state.write(': ');
      state.walk(value);
    } else { // kind is 'get' or 'set'
      l.logFuncTail(state, value as acorn.Function, true, false);
    }
  },
  FunctionExpression: (node, state) => {
    l.logLiteral(state, node, () => {
      l.logFuncDeclare(state, node, true);
    });
  },
  UnaryExpression: (node, state) => {
    l.logUnaryOp(state, node);
  },
  UpdateExpression: (node, state) => {
    l.logUpdateOp(state, node);
  },
  BinaryExpression: (node, state) => {
    l.logBinaryOp(state, node);
  },
  AssignmentExpression: (node, state) => {
    const { left, right, operator } = node;
    const enabled = true // set to true for now; additional parenthesis is needed
    if (enabled) state.write('(');
    switch (operator) {
      case '=': {
        l.logWrite(state, left, right, () => state.walk(right));
        break;
      }
      default: {
        l.writeCompoundAssignmentValue(state, node);
      }
    }
    if (enabled) state.write(')');
  },
  LogicalExpression: (node, state) => {
    const { left, right, operator } = node;
    const isDisabled = true // set to true for now; additional parenthesis is needed
    if (isDisabled) state.write('(');
    l.logCondition(state, left, operator);
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
      const { object, property, computed, optional } = node as acorn.MemberExpression;
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
    l.logGetField(state, node);
  },
  ConditionalExpression: (node, state) => {
    const { test, consequent, alternate } = node;
    l.logCondition(state, test, '?');
    state.write(' ? ');
    state.walk(consequent);
    state.write(' : ');
    state.walk(alternate);
  },
  CallExpression: (node, state) => {
    const { callee, arguments: args, optional } = node;
    l.logCall(state, callee, false, optional);
    state.write('(');
    state.walkArray(args);
    state.write(')');
  },
  NewExpression: (node, state) => {
    const { callee, arguments: args } = node;
    l.logCall(state, callee, true, false);
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
    l.logForInOfStatement(state, node, false, node.await);
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
    l.logLiteral(state, node, () => {
      l.logArrowFuncDeclare(state, node);
    });
  },
  YieldExpression: (node, state) => {
    l.logYield(state, node, node.argument, node.delegate);
  },
  TemplateLiteral: (node, state) => {
    // TODO it is not distinguished with string literal for the user
    l.logLiteral(state, node, () => {
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
    l.logTaggedCall(state, node.tag);
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
    l.logExpression(state, node.right as acorn.Expression);
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
    l.logFuncTail(state, value, true, false);
    if (isDerivedConstructor) state.isDerivedConstructor = false;
  },
  ClassDeclaration: (node, state) => {
    l.logClassDeclare(state, node, false);
  },
  ClassExpression: (node, state) => {
    l.logLiteral(state, node, () => {
      l.logClassDeclare(state, node, true);
    });
  },
  MetaProperty: (node, state) => {
    const name = `${node.meta.name}.${node.property.name}`;
    l.logRead(state, node, name);
  },
  ImportDeclaration: (node, state) => {
    state.write('import');
    if (node.specifiers.length > 0) {
      state.write(' ');
      l.writeImportClause(state, node.specifiers);
      state.write(' from ');
    } else {
      state.write(' ');
    }
    l.writeNodeAsSource(state, node.source);
    l.writeImportAttributes(state, (node as any).attributes);
    state.write(';');
  },
  ImportSpecifier: (node, state) => {
    l.writeNodeAsSource(state, node.imported);
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
    l.writeNodeAsSource(state, node.key);
    state.write(': ');
    l.writeNodeAsSource(state, node.value);
  },
  ExportNamedDeclaration: (node, state) => {
    state.write('export ');
    if (node.declaration) {
      state.walk(node.declaration);
      return;
    }
    l.writeExportSpecifiers(state, node.specifiers);
    if (node.source) {
      state.write(' from ');
      l.writeNodeAsSource(state, node.source);
      l.writeImportAttributes(state, (node as any).attributes);
    }
    state.write(';');
  },
  ExportSpecifier: (node, state) => {
    l.writeNodeAsSource(state, node.local);
    const localName = (node.local as any).name ?? (node.local as any).value;
    const exportedName = (node.exported as any).name ?? (node.exported as any).value;
    if (localName !== exportedName) {
      state.write(' as ');
      l.writeNodeAsSource(state, node.exported);
    }
  },
  ExportDefaultDeclaration: (node, state) => {
    state.write('export default ');
    const decl = node.declaration as acorn.Node;
    state.walk(decl);
    if (decl.type !== 'FunctionDeclaration' && decl.type !== 'ClassDeclaration') {
      state.write(';');
    }
  },
  ExportAllDeclaration: (node, state) => {
    state.write('export *');
    if ((node as any).exported) {
      state.write(' as ');
      l.writeNodeAsSource(state, (node as any).exported);
    }
    state.write(' from ');
    l.writeNodeAsSource(state, node.source);
    l.writeImportAttributes(state, (node as any).attributes);
    state.write(';');
  },
  AwaitExpression: (node, state) => {
    l.logAwait(state, node, node.argument);
  },
  ChainExpression: (node, state) => {
    if (!l.needsChainBoundary(state, node.expression)) {
      state.walk(node.expression);
      return;
    }
    state.write(`${LOG.CHAIN}(`);
    state.walk(node.expression);
    state.write(')');
  },
  ImportExpression: (node, state) => {
    state.write('import(');
    l.logExpression(state, (node as any).source);
    if ((node as any).options) {
      state.write(', ');
      l.logExpression(state, (node as any).options);
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

    if (!state.isEnabled.Fi && !computed) {
      if (value) {
        state.write(' = ');
        state.walk(value);
      }
      state.write(';');
      return;
    }

    const id = l.newId(node);
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
    state.withScope(scope => scope.walkArray(body), () => {
      state.wrap(() => {
        if (!state.isEnabled.SBe) {
          l.logDeclare(state, node);
          for (const statement of body) {
            state.writeln('');
            state.walk(statement);
          }
          return;
        }
        state.writeln('try {');
        state.wrap(() => {
          state.writeln(`${LOG.STATIC_BLOCK_ENTER}(${l.newId(node)}, this);`);
          l.logDeclare(state, node);
          for (const statement of body) {
            state.writeln('');
            state.walk(statement);
          }
        });
        state.writeln(`} catch (${EXCEPTION_VAR}) {`);
        state.wrap(() => {
          l.logException(state, node);
          state.writeln(`throw ${EXCEPTION_VAR};`);
        });
        state.writeln(`} finally {`);
        state.wrap(() => {
          state.writeln(`${LOG.STATIC_BLOCK_EXIT}(${l.newId(node)});`);
        });
        state.writeln(`}`);
      });
    });
    state.writeln('}');
  },
}
