import ts from 'typescript';
import { walk } from '../ast.js';
import { Loaded } from '../program.js';

// The analysis-callback universe (keys of callbackHintFull) and, for each
// PartialChecker getter/method, the set of callbacks that turn it on (req).
export interface Getters {
  universe: Set<string>;
  req: Map<string, Set<string>>; // getter name -> callbacks
}

const isCallbackHint = (e: ts.Expression): boolean =>
  ts.isPropertyAccessExpression(e) && e.name.text === 'callbackHint';

export function loadGetters(L: Loaded): Getters {
  const sf = L.sf('/partial.ts');
  const universe = new Set<string>();
  const req = new Map<string, Set<string>>();

  walk(sf, (n) => {
    if (
      ts.isVariableDeclaration(n) &&
      ts.isIdentifier(n.name) &&
      n.name.text === 'callbackHintFull' &&
      n.initializer &&
      ts.isObjectLiteralExpression(n.initializer)
    )
      for (const p of n.initializer.properties)
        if (p.name && (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name)))
          universe.add(p.name.text);
  });

  walk(sf, (n) => {
    if (!ts.isClassDeclaration(n) || n.name?.text !== 'PartialChecker') return;
    for (const m of n.members) {
      let name: string | undefined;
      if (ts.isGetAccessorDeclaration(m) && ts.isIdentifier(m.name)) name = m.name.text;
      else if (ts.isMethodDeclaration(m) && ts.isIdentifier(m.name)) name = m.name.text;
      if (!name) continue;
      const set = new Set<string>();
      walk(m, (x) => {
        if (ts.isPropertyAccessExpression(x) && isCallbackHint(x.expression))
          set.add(x.name.text);
      });
      req.set(name, set);
    }
  });

  return { universe, req };
}
