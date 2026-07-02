import ts from 'typescript';
import { walk } from './ast.js';
import { Loaded } from './program.js';

// A hook with no `state.partial` guard on any emit path is always emitted.
export const ALWAYS = '@always';

// constant.ts: `export const GET_FIELD = hook('G')` -> LOG.GET_FIELD names hook G.
export function constHookMap(L: Loaded): Map<string, string> {
  const m = new Map<string, string>();
  walk(L.sf('/instrument/constant.ts'), (n) => {
    if (
      ts.isVariableDeclaration(n) &&
      ts.isIdentifier(n.name) &&
      n.initializer &&
      ts.isCallExpression(n.initializer) &&
      ts.isIdentifier(n.initializer.expression) &&
      n.initializer.expression.text === 'hook' &&
      n.initializer.arguments[0] &&
      ts.isStringLiteral(n.initializer.arguments[0])
    )
      m.set(n.name.text, (n.initializer.arguments[0] as ts.StringLiteral).text);
  });
  return m;
}
