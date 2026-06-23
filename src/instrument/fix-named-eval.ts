import { simple } from 'acorn-walk';
import type * as acorn from 'acorn';

// Synthesizes an `id` on an anonymous FunctionExpression or ArrowFunctionExpression
// so that logFuncEnter can emit the inferred name rather than null.
// Only mutates when func.id is already null; named functions are left untouched.
function applyNamedEvaluation(
  func: acorn.FunctionExpression | acorn.ArrowFunctionExpression,
  name: string,
): void {
  if (func.id == null) {
    (func as any).id = {
      type: 'Identifier',
      name,
      start: func.start,
      end: func.start,
    } as acorn.Identifier;
  }
}

function isFuncExpr(
  node: acorn.AnyNode,
): node is acorn.FunctionExpression | acorn.ArrowFunctionExpression {
  return (
    node.type === 'FunctionExpression' ||
    node.type === 'ArrowFunctionExpression'
  );
}

// Named function expressions create an internal name binding (e.g. `function foo() {}`
// makes `foo` accessible within the body).  Arrow functions have no such binding, so
// the synthetic id can only be emitted safely when a same-named variable is in scope.
// This predicate identifies the cases where we can safely reference the name inside
// the function body regardless of outer scope.
function hasSelfBinding(
  func: acorn.FunctionExpression | acorn.ArrowFunctionExpression,
): boolean {
  return func.type === 'FunctionExpression';
}

function referencesName(node: acorn.Node, name: string): boolean {
  let found = false;
  simple(node, {
    Identifier(identifier) {
      if ((identifier as acorn.Identifier).name === name) {
        found = true;
      }
    },
  });
  return found;
}

// temporal fix
const TOP_PRIORITY_TARGETS = new Set(['toString', 'valueOf']);

// A simple ASCII identifier check.  Names from non-identifier string literals (e.g.
// "foo bar") cannot be used as function names in generated source.
const IDENTIFIER_RE = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
const RESERVED_WORDS = new Set([
  'await',
  'break',
  'case',
  'catch',
  'class',
  'const',
  'continue',
  'debugger',
  'default',
  'delete',
  'do',
  'else',
  'enum',
  'export',
  'extends',
  'finally',
  'for',
  'function',
  'if',
  'import',
  'in',
  'instanceof',
  'new',
  'return',
  'super',
  'switch',
  'this',
  'throw',
  'try',
  'typeof',
  'var',
  'void',
  'while',
  'with',
  'yield',
]);
function isIdentifier(name: string): boolean {
  return IDENTIFIER_RE.test(name) && !RESERVED_WORDS.has(name);
}

// Pre-pass: mutate all anonymous functions that sit in NamedEvaluation positions
// so downstream instrumentation picks up the inferred name.
// Covers:
//   - VariableDeclarator:     const foo = function() {}  /  const foo = () => {}
//   - Property (init, non-computed, non-method):  { bar: function() {} }
//   - AssignmentExpression (=, simple LHS):  x = function() {}  /  obj.p = () => {}
export function fixNamedEvaluations(ast: acorn.Node): void {
  // NOTE if there is a performance issue then call this in each node of visitor in visitor.ts using `recursive`
  simple(ast, {
    VariableDeclarator(node) {
      const { id, init } = node as acorn.VariableDeclarator;
      if (init != null && id.type === 'Identifier' && isFuncExpr(init)) {
        if (
          hasSelfBinding(init) &&
          referencesName(init.body as acorn.Node, id.name)
        )
          return;
        applyNamedEvaluation(init, id.name);
      }
    },

    Property(node) {
      const { key, value, kind, method, computed, shorthand } =
        node as acorn.Property;
      if (
        kind === 'init' &&
        !method &&
        !shorthand &&
        !computed &&
        isFuncExpr(value)
      ) {
        // Arrow functions don't have an internal name binding, so the name would be
        // an unresolvable free variable inside the body.  Only apply for FunctionExpression.
        if (!hasSelfBinding(value)) return;
        if (key.type === 'Identifier') {
          if (!TOP_PRIORITY_TARGETS.has(key.name)) return;
          applyNamedEvaluation(value, key.name);
        } else if (
          key.type === 'Literal' &&
          typeof key.value === 'string' &&
          isIdentifier(key.value)
        ) {
          if (!TOP_PRIORITY_TARGETS.has(key.value)) return;
          applyNamedEvaluation(value, key.value);
        }
      }
    },

    AssignmentExpression(node) {
      const { left, right, operator } = node as acorn.AssignmentExpression;
      if (operator === '=' && isFuncExpr(right)) {
        const func = right;
        if (left.type === 'Identifier') {
          // Identifier LHS is always in scope — safe for both FunctionExpression and arrow.
          applyNamedEvaluation(func, (left as acorn.Identifier).name);
        } else if (
          left.type === 'MemberExpression' &&
          !(left as acorn.MemberExpression).computed &&
          (left as acorn.MemberExpression).property.type === 'Identifier'
        ) {
          // The property name is NOT a variable binding, so only FunctionExpression is safe.
          if (!hasSelfBinding(func)) return;
          const name = (
            (left as acorn.MemberExpression).property as acorn.Identifier
          ).name;
          if (!TOP_PRIORITY_TARGETS.has(name)) return;
          if (isIdentifier(name)) applyNamedEvaluation(func, name);
        }
      }
    },
  });
}
