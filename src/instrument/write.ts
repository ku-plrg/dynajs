import * as LOG from './constant.js';
import type * as acorn from 'acorn';
import { getLocFromNode, VarKind, warn } from '../utils.js';
import { collectIdentifiers, getLocStr } from './aux.js';
import type { State } from './state.js';
import {
  POS_MODE_DEFAULT,
  EXCEPTION_VAR,
  INSTRUMENTED_MARK,
  PosMode,
  TEMP_PARAM_VAR,
} from '../constant.js';
import { generate } from 'astring';

export function hasUseStrictDirective(body: readonly acorn.AnyNode[]): boolean {
  for (const statement of body) {
    if (statement.type !== 'ExpressionStatement') return false;
    const expr = (statement as any).expression;
    if (expr.type !== 'Literal' || expr.value !== 'use strict') return false;
    return true;
  }
  return false;
}

// -----------------------------------------------------------------------------
// logging functions
// -----------------------------------------------------------------------------

export function logScriptEnter(state: State, program: acorn.Node): void {
  if (!state.partial.scriptEnter) return;
  const { instrumentedPath: i, originalPath: o } = state;
  state.writeln(`${LOG.SCRIPT_ENTER}(${newId(program)}, "${i}", "${o}");`);
}

export function logScriptExit(state: State, program: acorn.Node): void {
  if (!state.partial.scriptExit) return;
  state.writeln(`${LOG.SCRIPT_EXIT}(${newId(program)});`);
}

export function logCall(
  state: State,
  callee: acorn.Node,
  isConstructor: boolean,
  callOptional: boolean,
): void {
  if (!state.partial.F) {
    if (isConstructor) state.write('new ');
    state.walk(callee);
    return;
  }
  // Preserve direct-eval semantics. Rewriting `eval(...)` through a wrapper
  // turns it into an indirect call, which changes scope and breaks local lookups.
  const isDirectEval =
    !isConstructor &&
    !callOptional &&
    callee.type === 'Identifier' &&
    (callee as acorn.Identifier).name === 'eval';
  if (isDirectEval) {
    // Direct eval must stay as a direct call to preserve scope semantics.
    // The argument is wrapped by the CallExpression visitor via D$.Ev when
    // instrumentCodePre/instrumentCode callbacks are active.
    state.write('eval');
    return;
  }
  if (callee.type === 'MemberExpression') {
    const { object, property, computed, optional } =
      callee as acorn.MemberExpression;
    if (object.type === 'Super') {
      if (state.partial.Sm) {
        state.write(`${LOG.SUPER_METHOD_CALL}(${newId(callee)}, this, `);
        if (computed) {
          state.write(`${LOG.TEMP_VAR} = (`);
          state.walk(property);
          state.write(')');
        } else if (property.type === 'Identifier') {
          state.write(`"${property.name}"`);
        } else if (property.type === 'PrivateIdentifier') {
          state.write(`"#${(property as any).name}"`);
        }
        state.write(`, ${isConstructor}, ${optional}, ${callOptional}, `);
        if (computed) {
          state.write(`() => super[${LOG.TEMP_VAR}]`);
        } else if (property.type === 'Identifier') {
          state.write(`() => super.${property.name}`);
        } else if (property.type === 'PrivateIdentifier') {
          state.write(`() => super.#${(property as any).name}`);
        }
        state.write(')');
      } else {
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
      }
      return;
    }
    if (property.type === 'PrivateIdentifier') {
      state.write(`${LOG.PRIVATE_METHOD_CALL}(${newId(callee)}, `);
      state.walk(object);
      state.write(
        `, "${getPrivateName(property)}", ${isConstructor}, ${optional}, ${callOptional}, `,
      );
      writePrivateGetter(state, property);
      state.write(')');
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
    if (state.partial.Su) {
      const argsVar = `${TEMP_PARAM_VAR}a`;
      state.write(
        `${LOG.SUPER_CALL}(${newId(callee)}, (...${argsVar}) => super(...${argsVar}))`,
      );
    } else {
      state.write('super');
    }
  } else {
    state.write(`${LOG.FUNCTION_CALL}(${newId(callee)}, `);
    state.walk(callee);
    state.write(`, ${isConstructor}, ${callOptional})`);
  }
}

// logging a tagged template call (uses TF/TM hooks with general-first hierarchy)
export function logTaggedCall(state: State, tag: acorn.Node): void {
  if (!state.partial.TF) {
    state.walk(tag);
    return;
  }
  if (tag.type === 'MemberExpression') {
    const { object, property, computed } = tag as acorn.MemberExpression;
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
      state.write(`${LOG.PRIVATE_TAGGED_METHOD}(${newId(tag)}, `);
      state.walk(object);
      state.write(`, "${getPrivateName(property)}", `);
      writePrivateGetter(state, property);
      state.write(')');
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
      warn(
        `TaggedTemplate MemberExpression: unexpected property type${getLocStr(tag)}`,
      );
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

export function logClassDeclare(
  state: State,
  node: acorn.Node,
  isExpr: boolean,
): void {
  const { id, superClass, body } = node as acorn.Class;
  state.write('class ');
  if (id) state.write(id.name + ' ');
  if (superClass) {
    // Unlift the heritage so native `extends` sees a raw constructor/null, not a
    // lifted-primitive proxy (e.g. `extends null`). See LOG.CLASS_HERITAGE / Hc.
    state.write(`extends ${LOG.CLASS_HERITAGE}(${newId(superClass)}, `);
    state.walk(superClass);
    state.write(') ');
  }
  // the stamp inside the class body covers bodiless classes (`class K {}`),
  // whose toString contains no method body to carry one
  state.write(`{ ${INSTRUMENTED_MARK}`);
  const prevInDerivedClass = state.inDerivedClass;
  state.inDerivedClass = !!superClass;
  state.wrap(() => state.walk(body));
  state.inDerivedClass = prevInDerivedClass;
  state.writeln('}');
}

export function logFuncDeclare(
  state: State,
  node: acorn.Function,
  isExpr: boolean,
): void {
  const { id, generator, async } = node;
  if (async) state.write('async ');
  state.write('function');
  if (generator) state.write('*');
  state.write(' ');
  if (id) state.write(id.name);
  logFuncTail(state, node, isExpr, false);
}

export function logArrowFuncDeclare(state: State, node: acorn.Function): void {
  const { async } = node as acorn.Function;
  state.write(async ? 'async ' : '');
  logFuncTail(state, node, true, true);
}

export function logFuncTail(
  state: State,
  node: acorn.Function,
  isExpr: boolean,
  isArrow: boolean,
): void {
  state.withScope(
    (scope) => scope.walkFunction(node, isExpr),
    () => {
      const { params, body, type, id } = node;
      const strict =
        state.isStrict ||
        (body.type === 'BlockStatement' && hasUseStrictDirective(body.body));
      const wrapWithExceptionFrame =
        state.partial.Fe || state.partial.shouldWrapThrow;
      state.write('(');
      state.withLHS(() => state.walkArray(params));
      // every function-like body funnels through here (expression-bodied arrows
      // included — they are emitted as block bodies), so this one stamp makes
      // toString-based isInstrumented complete over all function syntax
      state.write(
        isArrow ? `) => { ${INSTRUMENTED_MARK}` : `) { ${INSTRUMENTED_MARK}`,
      );
      state.withStrictMode(strict, () => {
        state.wrap(() => {
          if (wrapWithExceptionFrame) {
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
                state.writeln('');
                logReturn(state, body, () => logExpression(state, body));
              }
            });
            state.writeln(`} catch (${EXCEPTION_VAR}) {`);
            state.wrap(() => {
              logException(state, node);
              if (!state.partial.Fe) {
                state.writeln(`throw ${EXCEPTION_VAR};`);
              }
            });
            state.writeln(`} finally {`);
            state.wrap(() => {
              logFuncExit(state, node as acorn.Function);
            });
            state.writeln(`}`);
          } else {
            logFuncEnter(state, node);
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
          }
        });
      });
    },
  );
  state.writeln('}');
}

export function logFuncEnter(state: State, func: acorn.Function): void {
  if (!state.partial.Fe) return;
  const { id } = func;
  let name: string;
  if (id == null) {
    // No inferred name was set by the fixNamedEvaluations pre-pass for this context.
    name = 'null';
  } else {
    // If the function name is shadowed by a TDZ binding (const/let/class) in
    // the function body scope, accessing the identifier would throw a
    // ReferenceError, so use `null` instead.
    const isTDZ = state.scope?.tdzShadowedFuncNames.has(id.name) ?? false;
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
        parts.push((p as acorn.Identifier).name);
      } else if (p.type === 'RestElement' && p.argument.type === 'Identifier') {
        parts.push(`...${(p.argument as acorn.Identifier).name}`);
      } else {
        ok = false;
        break;
      }
    }
    argsExpr = ok ? `[${parts.join(', ')}]` : '[]';
  } else {
    argsExpr = 'arguments';
  }
  state.writeln(
    `${LOG.FUNC_ENTER}(${newId(func)}, ${name}, ${thisArg}, ${argsExpr}, ${func.async}, ${func.generator});`,
  );
}

export function logFuncExit(state: State, func: acorn.Function): void {
  if (!state.partial.Fe) return;
  state.writeln(
    `${LOG.FUNC_EXIT}(${newId(func)}, ${func.async}, ${func.generator});`,
  );
}

export function logReturn(
  state: State,
  expr: acorn.ReturnStatement | acorn.Expression,
  body: () => void,
): void {
  if (!state.partial.Re) {
    state.write('return ');
    body();
    state.write(';');
    return;
  }
  state.write(`return ${LOG.RETURN}(${newId(expr)}, `);
  body();
  state.write(');');
}

export function logForInOfStatement(
  state: State,
  node: acorn.ForInStatement | acorn.ForOfStatement,
  isForIn: boolean,
  isAwait: boolean,
): void {
  const { left, right, body } = node;
  const awaitStr = isAwait ? 'await ' : '';
  const prep = isForIn ? 'in' : 'of';
  state.write(`for ${awaitStr}(${LOG.TEMP_VAR} ${prep} `);
  logForInOfObject(state, right, true);
  state.write(') {');
  state.wrap(() => {
    state.withScope(
      (scope) => scope.walk(left),
      () => {
        logDeclare(state, left);
        state.writeln('');
        let id: acorn.Pattern;
        if (left.type === 'VariableDeclaration') {
          const { declarations, kind } = left;
          state.write(`${kind} `);
          id = declarations[0].id;
        } else {
          id = left;
        }
        const needsParens =
          left.type !== 'VariableDeclaration' && id.type === 'ObjectPattern';
        if (needsParens) state.write('(');
        logWrite(state, id, right, () => state.write(LOG.TEMP_VAR));
        if (needsParens) state.write(')');
        state.write(';');
        state.writeln('');
        state.walk(body);
      },
      true,
    );
  });
  state.writeln('}');
}

export function logForInOfObject(
  state: State,
  expr: acorn.Expression,
  isForIn: boolean,
): void {
  if (!state.partial.forLoopRhsObj) {
    state.walk(expr);
  } else {
    state.write(`${LOG.FOR_IN_OF_OBJECT}(${newId(expr)}, `);
    state.walk(expr);
    state.write(`, ${isForIn})`);
  }
}

export function logExpression(state: State, expr: acorn.Expression): void {
  if (!state.partial.E) {
    state.walk(expr);
  } else {
    state.write(`${LOG.EXPRESSION}(${newId(expr)}, `);
    state.walk(expr);
    state.write(')');
  }
}

export function logGetField(state: State, expr: acorn.Expression): void {
  const { object, property, computed, optional } =
    expr as acorn.MemberExpression;
  if (object.type === 'Super') {
    if (state.partial.Gs) {
      state.write(`${LOG.SUPER_GET_FIELD}(${newId(expr)}, this, `);
      if (computed) {
        state.write(`${LOG.TEMP_VAR} = (`);
        state.walk(property);
        state.write('), () => super[' + LOG.TEMP_VAR + ']');
      } else if (property.type === 'Identifier') {
        state.write(`"${property.name}", () => super.${property.name}`);
      } else if (property.type === 'PrivateIdentifier') {
        state.write(
          `"#${(property as any).name}", () => super.#${(property as any).name}`,
        );
      } else {
        warn(
          `MemberExpression: unexpected super property type${getLocStr(expr)}`,
        );
      }
      state.write(')');
    } else {
      state.write('super');
      if (computed) {
        state.write(optional ? '?.[' : '[');
        state.walk(property);
        state.write(']');
      } else if (property.type === 'Identifier') {
        state.write(optional ? `?.${property.name}` : `.${property.name}`);
      } else if (property.type === 'PrivateIdentifier') {
        state.write(
          optional
            ? `?.#${(property as any).name}`
            : `.#${(property as any).name}`,
        );
      } else {
        warn(
          `MemberExpression: unexpected super property type${getLocStr(expr)}`,
        );
      }
    }
    return;
  }
  if (!state.partial.G) {
    state.walk(object);
    if (computed) {
      state.write(optional ? '?.[' : '[');
      state.walk(property);
      state.write(']');
    } else if (property.type === 'Identifier') {
      state.write(optional ? `?.${property.name}` : `.${property.name}`);
    } else if (property.type === 'PrivateIdentifier') {
      state.write(
        optional
          ? `?.#${(property as any).name}`
          : `.#${(property as any).name}`,
      );
    } else {
      warn(`MemberExpression: unexpected property type${getLocStr(expr)}`);
    }
    return;
  }
  if (property.type === 'PrivateIdentifier') {
    state.write(`${LOG.PRIVATE_GET_FIELD}(${newId(expr)}, `);
    state.walk(object);
    state.write(`, "${getPrivateName(property)}", `);
    writePrivateGetter(state, property);
    if (optional) state.write(', true');
    state.write(')');
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

export function logPutField(
  state: State,
  lhs: acorn.Node,
  rhs: acorn.Node,
  body: () => void,
): void {
  const { object, property, computed } = lhs as acorn.MemberExpression;
  if (object.type === 'Super') {
    if (state.partial.Ps) {
      const valVar = `${TEMP_PARAM_VAR}v`;
      state.write(`${LOG.SUPER_PUT_FIELD}(${newId(lhs)}, this, `);
      if (computed) {
        state.write(`${LOG.TEMP_VAR} = (`);
        state.walk(property);
        state.write('), ');
        body();
        state.write(`, ${valVar} => super[${LOG.TEMP_VAR}] = ${valVar}`);
      } else if (property.type === 'Identifier') {
        state.write(`"${property.name}", `);
        body();
        state.write(`, ${valVar} => super.${property.name} = ${valVar}`);
      } else if (property.type === 'PrivateIdentifier') {
        state.write(`"#${(property as any).name}", `);
        body();
        state.write(
          `, ${valVar} => super.#${(property as any).name} = ${valVar}`,
        );
      } else {
        warn(
          `MemberExpression: unexpected super property type${getLocStr(lhs)}`,
        );
      }
      state.write(')');
    } else {
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
        warn(
          `MemberExpression: unexpected super property type${getLocStr(lhs)}`,
        );
      }
      body();
    }
    return;
  }
  if (!state.partial.P) {
    state.walk(object);
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
    state.write(`${LOG.PRIVATE_PUT_FIELD}(${newId(lhs)}, `);
    state.walk(object);
    state.write(`, "${getPrivateName(property)}", `);
    body();
    state.write(', ');
    writePrivateSetter(state, property);
    state.write(')');
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

export function logDelete(state: State, expr: acorn.Expression): void {
  if (!state.partial.De) {
    if (expr.type === 'MemberExpression') {
      const { object, property, computed, optional } =
        expr as acorn.MemberExpression;
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
        state.write(
          optional
            ? `?.#${(property as any).name}`
            : `.#${(property as any).name}`,
        );
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
    logDelete(state, expr.expression);
    state.write(')');
  } else if (expr.type === 'MemberExpression') {
    const { object, property, computed, optional } =
      expr as acorn.MemberExpression;
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
export function logUnaryOp(state: State, expr: acorn.UnaryExpression): void {
  const { argument, operator } = expr;
  if (operator === 'delete') {
    logDelete(state, argument);
    return;
  }
  if (!state.partial.U) {
    if (operator === 'typeof' && argument.type === 'Identifier') {
      state.write(`typeof ${(argument as acorn.Identifier).name}`);
    } else {
      state.write(`${operator} `);
      state.walk(argument);
    }
    return;
  }
  state.write(`${LOG.UNARY_OP}(${newId(expr)}, "${operator}", `);
  // special handling for `typeof x` where x is an identifier to avoid ReferenceError
  if (operator === 'typeof' && argument.type === 'Identifier') {
    var x = (argument as acorn.Identifier).name;
    state.write(`typeof ${x} === "undefined" ? undefined : `);
  }
  state.walk(argument);
  state.write(')');
}

export function logBinaryOp(state: State, expr: acorn.BinaryExpression): void {
  const { left, right, operator } = expr;
  // Ergonomic brand check `#priv in obj`: a private-name reference is only legal
  // as the immediate LHS of `in`, so it cannot be lifted into a D$.B argument.
  if (operator === 'in' && left.type === 'PrivateIdentifier') {
    state.write('(');
    state.walk(left);
    state.write(' in ');
    state.walk(right);
    state.write(')');
    return;
  }
  const enabled = state.partial.B;
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

export function logUpdateOp(state: State, expr: acorn.UpdateExpression): void {
  if (!state.partial.U) {
    state.write(generate(expr));
    return;
  }
  const { argument, operator, prefix } = expr;
  state.write(
    `${LOG.UPDATE_OP}(${newId(expr)}, ${newId(expr)}, "${operator}", ${prefix}, `,
  );
  state.walk(argument);
  state.write(`, ${TEMP_PARAM_VAR} => `);
  logWrite(state, argument, argument, () => state.write(TEMP_PARAM_VAR));
  state.write(')');
}

export function logCondition(
  state: State,
  test: acorn.Expression,
  kind: string,
  end: boolean = false,
): void {
  if (!state.partial.C) {
    if (end) logExpression(state, test);
    else state.walk(test);
    return;
  }
  state.write(`${LOG.CONDITION}(${newId(test)}, "${kind}", `);
  if (end) logExpression(state, test);
  else state.walk(test);
  state.write(`)`);
}

export function logSwitchLeft(
  state: State,
  discriminant: acorn.Expression,
): void {
  if (!state.partial.C && !state.partial.B) {
    logExpression(state, discriminant);
    return;
  }
  state.write(`${LOG.SWITCH_LEFT}(${newId(discriminant)}, `);
  logExpression(state, discriminant);
  state.write(')');
}

export function logSwitchRight(state: State, test: acorn.Expression): void {
  if (!state.partial.C && !state.partial.B) {
    logExpression(state, test);
    return;
  }
  state.write(`${LOG.SWITCH_RIGHT}(${newId(test)}, `);
  logExpression(state, test);
  state.write(')');
}

export function logDeclare(
  state: State,
  node:
    | acorn.Pattern
    | acorn.Identifier
    | acorn.BlockStatement
    | acorn.CatchClause
    | acorn.VariableDeclaration
    | acorn.StaticBlock
    | acorn.Program
    | acorn.Function,
): void {
  if (!state.partial.declare) return;
  const vars = state.scope?.vars;
  if (!vars) return;
  const spreadVars = state.scope?.spreadVars;
  const isLexicalScope = state.scope?.isLexicalScope() ?? false;
  for (const name in vars) {
    const kind = vars[name];
    if (isLexicalScope && kind === VarKind.Func) continue;
    const isTDZ =
      kind === VarKind.Const ||
      kind === VarKind.Let ||
      kind === VarKind.Class ||
      (state.scope?.tdzShadowedFuncNames.has(name) ?? false);
    const isSpread = spreadVars?.has(name) ?? false;
    const omitValue = isTDZ;
    if (omitValue) {
      state.writeln(
        `${LOG.DECLARE}(${newId(node)}, "${name}", ${kind}, ${isSpread});`,
      );
    } else {
      state.writeln(
        `${LOG.DECLARE}(${newId(node)}, "${name}", ${kind}, ${isSpread}, ${name});`,
      );
    }
  }
}

export function logRead(
  state: State,
  node: acorn.ThisExpression | acorn.MetaProperty | acorn.Identifier,
  name: string,
): void {
  if (!state.partial.R) {
    state.write(name);
    return;
  }
  state.write(`${LOG.READ}(${newId(node)}, "${name}", ${name})`);
}

export function logWrite(
  state: State,
  lhs: acorn.Pattern | acorn.Expression,
  rhs: acorn.Node,
  body: () => void,
): void {
  if (lhs.type === 'MemberExpression') {
    logPutField(state, lhs, rhs, body);
  } else if (lhs.type === 'ObjectPattern' || lhs.type === 'ArrayPattern') {
    if (!state.partial.W) {
      state.withLHS(() => state.walk(lhs));
      state.write(' = ');
      body();
      return;
    }
    // destructuring write
    state.withLHS(() => state.walk(lhs));
    state.write(` = ${LOG.WRITE}(${newId(rhs)}, `);
    const xs = collectIdentifiers(lhs as acorn.Pattern);
    state.write(`[${xs.map((x) => `"${x}"`).join(', ')}], `);
    body();
    state.write(')');
  } else {
    if (!state.partial.W) {
      const x = lhs as acorn.Identifier;
      state.write(`${x.name} = `);
      body();
      return;
    }
    // variable write
    const x = lhs as acorn.Identifier;
    state.write(`${x.name} = ${LOG.WRITE}(${newId(rhs)}, `);
    const xs = collectIdentifiers(lhs as acorn.Pattern);
    state.write(`[${xs.map((x) => `"${x}"`).join(', ')}], `);
    body();
    state.write(')');
  }
}

export function logLiteral(
  state: State,
  literal:
    | acorn.Literal
    | acorn.ArrayExpression
    | acorn.ObjectExpression
    | acorn.FunctionExpression
    | acorn.ClassExpression
    | acorn.TemplateLiteral
    | acorn.ArrowFunctionExpression,
  body?: () => void,
): void {
  const enabled = state.partial.literal(literal);
  if (!enabled) {
    // to handle iife like (function(){})() or (function () {}).call(...)
    const isFunctionLike =
      literal.type === 'FunctionExpression' ||
      literal.type === 'ClassExpression' ||
      literal.type === 'ArrowFunctionExpression';
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

// logging a synthesized string literal for template literal quasis.
export function writeQuasiLiteral(
  state: State,
  refNode: acorn.Node,
  value: string,
): void {
  const synthetic = {
    type: 'Literal',
    value,
    raw: JSON.stringify(value),
  } as unknown as acorn.Literal;
  if (state.partial.literal(synthetic)) {
    state.write(`${LOG.LITERAL}(${newId(refNode)}, ${JSON.stringify(value)})`);
  } else {
    state.write(JSON.stringify(value));
  }
}

export function logThrow(state: State, arg: acorn.Expression): void {
  if (!state.partial.Th) {
    logExpression(state, arg);
    return;
  }
  state.write(`${LOG.THROW}(${newId(arg)}, `);
  logExpression(state, arg);
  state.write(')');
}

export function logYield(
  state: State,
  node: acorn.Node,
  argument: acorn.Expression | null | undefined,
  delegate: boolean,
): void {
  if (!state.partial.Y) {
    state.write('yield');
    if (delegate) state.write('*');
    state.write(' ');
    if (argument) logExpression(state, argument);
    else state.write('undefined');
  } else {
    state.write(
      `${LOG.YIELD_RESULT}(${newId(node)}, yield${delegate ? '*' : ''} ${LOG.YIELD}(${newId(node)}, `,
    );
    if (argument) logExpression(state, argument);
    else state.write('undefined');
    state.writeln(`, ${delegate}))`);
  }
}

export function logAwait(
  state: State,
  node: acorn.Node,
  argument: acorn.Expression | null | undefined,
): void {
  if (!state.partial.Aw) {
    state.write('await ');
    if (argument) logExpression(state, argument);
    else state.write('undefined');
  } else {
    state.write(
      `${LOG.AWAIT_RESULT}(${newId(node)}, await ${LOG.AWAIT}(${newId(node)}, `,
    );
    if (argument) logExpression(state, argument);
    else state.write('undefined');
    state.write(`))`);
  }
}

export function logException(state: State, program: acorn.Node): void {
  state.writeln(`${LOG.EXCEPTION}(${newId(program)}, ${EXCEPTION_VAR});`);
}

// -----------------------------------------------------------------------------
// unique id generator
// -----------------------------------------------------------------------------
let numId: number = 0;
let ID_INC_STEP: 1 | -1 = 1;
let fileIdToLoc: { [id: number]: [number, number, number, number] } = {};
let currentLocMode: PosMode = POS_MODE_DEFAULT;

export function initializeIdGenerator(isESM: boolean): void {
  if (isESM) {
    numId = -1;
    ID_INC_STEP = -1;
  } else {
    numId = 0;
    ID_INC_STEP = 1;
  }
}

export function beginLocCollection(locMode: PosMode): void {
  currentLocMode = locMode;
  fileIdToLoc = {};
}

export function getFileIdToLoc(): {
  [id: number]: [number, number, number, number];
} {
  return fileIdToLoc;
}

export function newId(node: acorn.Node): number {
  var id = numId;
  numId += ID_INC_STEP;
  if (node.loc && currentLocMode !== PosMode.OFF) {
    fileIdToLoc[id] = getLocFromNode(node);
  }
  return id;
}

export function needsChainBoundary(state: State, node: acorn.Node): boolean {
  switch (node.type) {
    case 'MemberExpression': {
      const expr = node as acorn.MemberExpression;
      return (
        (expr.optional && state.partial.G) ||
        needsChainBoundary(state, expr.object)
      );
    }
    case 'CallExpression': {
      const expr = node as acorn.CallExpression;
      return state.partial.F || needsChainBoundary(state, expr.callee);
    }
    case 'ChainExpression':
      return needsChainBoundary(
        state,
        (node as acorn.ChainExpression).expression,
      );
    case 'UnaryExpression':
      return (
        (node as acorn.UnaryExpression).operator === 'delete' &&
        state.partial.De
      );
    default:
      return false;
  }
}

export function writeNodeAsSource(state: State, node: acorn.Node): void {
  state.write(generate(node as any));
}

export function writeImportAttributes(
  state: State,
  attributes?: readonly acorn.Node[] | null,
): void {
  if (!attributes || attributes.length === 0) return;
  state.write(' with { ');
  for (let i = 0; i < attributes.length; i++) {
    if (i > 0) state.write(', ');
    state.walk(attributes[i]);
  }
  state.write(' }');
}

export function writeImportClause(
  state: State,
  specifiers: readonly acorn.Node[],
): void {
  const defaultSpec = specifiers.find(
    (spec) => spec.type === 'ImportDefaultSpecifier',
  ) as any;
  const namespaceSpec = specifiers.find(
    (spec) => spec.type === 'ImportNamespaceSpecifier',
  ) as any;
  const namedSpecs = specifiers.filter(
    (spec) => spec.type === 'ImportSpecifier',
  ) as any[];
  let needsComma = false;

  if (defaultSpec) {
    state.write(defaultSpec.local.name);
    needsComma = true;
  }
  if (namespaceSpec) {
    if (needsComma) state.write(', ');
    state.write(`* as ${namespaceSpec.local.name}`);
    needsComma = true;
  }
  if (namedSpecs.length > 0) {
    if (needsComma) state.write(', ');
    state.write('{ ');
    for (let i = 0; i < namedSpecs.length; i++) {
      if (i > 0) state.write(', ');
      const spec = namedSpecs[i];
      writeNodeAsSource(state, spec.imported);
      if (spec.local.name !== (spec.imported as any).name) {
        state.write(` as ${spec.local.name}`);
      }
    }
    state.write(' }');
  }
}

export function writeExportSpecifiers(
  state: State,
  specifiers: readonly acorn.Node[],
): void {
  state.write('{ ');
  for (let i = 0; i < specifiers.length; i++) {
    if (i > 0) state.write(', ');
    const spec = specifiers[i] as any;
    writeNodeAsSource(state, spec.local);
    const localName = (spec.local as any).name ?? (spec.local as any).value;
    const exportedName =
      (spec.exported as any).name ?? (spec.exported as any).value;
    if (localName !== exportedName) {
      state.write(' as ');
      writeNodeAsSource(state, spec.exported);
    }
  }
  state.write(' }');
}

function getPrivateName(node: acorn.PrivateIdentifier): string {
  return `#${node.name}`;
}

function writePrivateGetter(
  state: State,
  property: acorn.PrivateIdentifier,
): void {
  state.write(
    `${TEMP_PARAM_VAR} => ${TEMP_PARAM_VAR}.${getPrivateName(property)}`,
  );
}

function writePrivateSetter(
  state: State,
  property: acorn.PrivateIdentifier,
): void {
  const valueParam = `${TEMP_PARAM_VAR}v`;
  state.write(
    `(${TEMP_PARAM_VAR}, ${valueParam}) => ${TEMP_PARAM_VAR}.${getPrivateName(property)} = ${valueParam}`,
  );
}

function getAssignmentBinaryOperator(operator: string): string | null {
  switch (operator) {
    case '+=':
      return '+';
    case '-=':
      return '-';
    case '*=':
      return '*';
    case '/=':
      return '/';
    case '%=':
      return '%';
    case '**=':
      return '**';
    case '<<=':
      return '<<';
    case '>>=':
      return '>>';
    case '>>>=':
      return '>>>';
    case '|=':
      return '|';
    case '^=':
      return '^';
    case '&=':
      return '&';
    default:
      return null;
  }
}

function getLogicalAssignmentOperator(operator: string): string | null {
  switch (operator) {
    case '&&=':
      return '&&';
    case '||=':
      return '||';
    case '??=':
      return '??';
    default:
      return null;
  }
}

export function nextTempSlot(node: acorn.Node): string {
  let n = newId(node);
  let str = n < 0 ? `n${-n}` : `p${n}`;
  return `${LOG.TEMP_VAR}${str}`;
}

export function writeTempRef(state: State, slot: string): void {
  state.write(slot);
}

export function writeCompoundMemberGet(
  state: State,
  expr: acorn.MemberExpression,
  objectRef: string,
  propertyRef: string | null,
): void {
  const { property, computed, optional } = expr;
  if (!state.partial.G) {
    writeTempRef(state, objectRef);
    if (computed) {
      state.write(optional ? '?.[' : '[');
      if (propertyRef != null) writeTempRef(state, propertyRef);
      else state.walk(property);
      state.write(']');
    } else if (property.type === 'Identifier') {
      state.write(optional ? `?.${property.name}` : `.${property.name}`);
    } else if (property.type === 'PrivateIdentifier') {
      state.write(
        optional
          ? `?.#${(property as any).name}`
          : `.#${(property as any).name}`,
      );
    } else {
      warn(`MemberExpression: unexpected property type${getLocStr(expr)}`);
    }
    return;
  }
  if (property.type === 'PrivateIdentifier') {
    state.write(`${LOG.PRIVATE_GET_FIELD}(${newId(expr)}, `);
    writeTempRef(state, objectRef);
    state.write(`, "${getPrivateName(property)}", `);
    writePrivateGetter(state, property);
    if (optional) state.write(', true');
    state.write(')');
    return;
  }
  state.write(`${LOG.GET_FIELD}(${newId(expr)}, `);
  writeTempRef(state, objectRef);
  state.write(', ');
  if (computed) {
    if (propertyRef != null) writeTempRef(state, propertyRef);
    else state.walk(property);
  } else if (property.type === 'Identifier') {
    state.write(`"${property.name}"`);
  } else {
    warn(`MemberExpression: unexpected property type${getLocStr(expr)}`);
  }
  if (optional) state.write(', true');
  state.write(')');
}

export function writeCompoundMemberPut(
  state: State,
  lhs: acorn.MemberExpression,
  rhs: acorn.Node,
  objectRef: string,
  propertyRef: string | null,
  body: () => void,
): void {
  const { property, computed } = lhs;
  if (!state.partial.P) {
    writeTempRef(state, objectRef);
    if (computed) {
      state.write('[');
      if (propertyRef != null) writeTempRef(state, propertyRef);
      else state.walk(property);
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
    state.write(`${LOG.PRIVATE_PUT_FIELD}(${newId(lhs)}, `);
    writeTempRef(state, objectRef);
    state.write(`, "${getPrivateName(property)}", `);
    body();
    state.write(', ');
    writePrivateSetter(state, property);
    state.write(')');
    return;
  }
  state.write(`${LOG.PUT_FIELD}(${newId(lhs)}, `);
  writeTempRef(state, objectRef);
  state.write(', ');
  if (computed) {
    if (propertyRef != null) writeTempRef(state, propertyRef);
    else state.walk(property);
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

export function writeAssignmentWrite(
  state: State,
  lhs: acorn.Identifier | acorn.MemberExpression,
  rhs: acorn.Node,
  body: () => void,
  objectRef?: string,
  propertyRef?: string | null,
): void {
  if (lhs.type === 'MemberExpression') {
    if (objectRef != null) {
      writeCompoundMemberPut(
        state,
        lhs as acorn.MemberExpression,
        rhs,
        objectRef,
        propertyRef ?? null,
        body,
      );
    } else {
      logPutField(state, lhs, rhs, body);
    }
    return;
  }
  logWrite(state, lhs, rhs, body);
}

export function writeCompoundAssignmentRead(
  state: State,
  lhs: acorn.Identifier | acorn.MemberExpression,
  objectRef?: string,
  propertyRef?: string | null,
): void {
  if (lhs.type === 'MemberExpression') {
    if (objectRef != null) {
      writeCompoundMemberGet(state, lhs, objectRef, propertyRef ?? null);
    } else {
      logGetField(state, lhs);
    }
    return;
  }
  state.walk(lhs);
}

export function writeCompoundAssignmentValue(
  state: State,
  node: acorn.AssignmentExpression,
): void {
  const { left, right, operator } = node;
  const binaryOperator = getAssignmentBinaryOperator(operator);
  const logicalOperator = getLogicalAssignmentOperator(operator);
  if (binaryOperator == null && logicalOperator == null) {
    state.write(generate(node));
    return;
  }

  if (left.type !== 'Identifier' && left.type !== 'MemberExpression') {
    state.write(generate(node));
    return;
  }

  if (left.type === 'MemberExpression' && left.object.type === 'Super') {
    state.write(generate(node));
    return;
  }

  const needsTemps = left.type === 'MemberExpression';
  const objectSlot = needsTemps ? nextTempSlot(left.object) : null;
  const propertySlot =
    needsTemps && left.computed ? nextTempSlot(left.property) : null;

  if (needsTemps) {
    state.write('(');
    state.write(`${objectSlot} = `);
    state.walk(left.object);
    state.write(', ');
    if (propertySlot) {
      state.write(`${propertySlot} = `);
      state.walk(left.property);
      state.write(', ');
    }
  }

  if (binaryOperator != null) {
    writeAssignmentWrite(
      state,
      left,
      node,
      () => {
        state.write(`${LOG.BINARY_OP}(${newId(node)}, "${binaryOperator}", `);
        writeCompoundAssignmentRead(
          state,
          left,
          objectSlot ?? undefined,
          propertySlot,
        );
        state.write(', ');
        state.walk(right);
        state.write(')');
      },
      objectSlot ?? undefined,
      propertySlot,
    );
  } else {
    state.write(`${LOG.CONDITION}(${newId(left)}, "${logicalOperator}", `);
    writeCompoundAssignmentRead(
      state,
      left,
      objectSlot ?? undefined,
      propertySlot,
    );
    state.write(`) ${logicalOperator} `);
    state.write('(');
    writeAssignmentWrite(
      state,
      left,
      node,
      () => state.walk(right),
      objectSlot ?? undefined,
      propertySlot,
    );
    state.write(')');
  }

  if (needsTemps) {
    state.write(')');
  }
}
