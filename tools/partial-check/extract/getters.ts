import ts from 'typescript';
import { walk } from '../ast.js';
import { Loaded } from '../program.js';

// The analysis-callback universe (keys of callbackHintFull) and, for each
// PartialChecker getter/method, the set of callbacks that turn it on (req).
// Getters now come in three shapes (post-refactor): PRIMARY (a real
// this.callbackHint.* disjunction), DELEGATING (`return this.F` — rides another
// getter), and ALWAYS-ON (`return true`). loadGetters resolves delegation and
// always-on so `req` is accurate for every getter, not just the primaries.
export interface Getters {
  universe: Set<string>;
  req: Map<string, Set<string>>; // getter -> callbacks (⊇ universe for always-on)
  shape: Map<string, 'primary' | 'delegating' | 'always-on'>;
}

const isCallbackHint = (e: ts.Expression): boolean =>
  ts.isPropertyAccessExpression(e) && e.name.text === 'callbackHint';
const isThis = (e: ts.Expression): boolean => e.kind === ts.SyntaxKind.ThisKeyword;

export function loadGetters(L: Loaded): Getters {
  const sf = L.sf('/partial.ts');
  const universe = new Set<string>();
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

  // pass 1: per getter, collect direct callbacks, delegated getters, always-on
  const direct = new Map<string, Set<string>>();
  const delegates = new Map<string, Set<string>>();
  const alwaysOn = new Set<string>();
  const names = new Set<string>();
  walk(sf, (n) => {
    if (!ts.isClassDeclaration(n) || n.name?.text !== 'PartialChecker') return;
    for (const m of n.members) {
      let name: string | undefined;
      if (ts.isGetAccessorDeclaration(m) && ts.isIdentifier(m.name)) name = m.name.text;
      else if (ts.isMethodDeclaration(m) && ts.isIdentifier(m.name)) name = m.name.text;
      if (!name) continue;
      names.add(name);
      const d = new Set<string>();
      const dg = new Set<string>();
      walk(m, (x) => {
        if (ts.isPropertyAccessExpression(x) && isCallbackHint(x.expression))
          d.add(x.name.text); // this.callbackHint.<cb>
        else if (ts.isPropertyAccessExpression(x) && isThis(x.expression))
          dg.add(x.name.text); // this.<otherGetter>
        else if (x.kind === ts.SyntaxKind.TrueKeyword && ts.isReturnStatement(x.parent))
          alwaysOn.add(name!);
      });
      direct.set(name, d);
      delegates.set(name, dg);
    }
  });

  // pass 2: resolve delegation transitively; always-on ⇒ whole universe
  const req = new Map<string, Set<string>>();
  const resolve = (g: string, seen = new Set<string>()): Set<string> => {
    if (req.has(g)) return req.get(g)!;
    if (seen.has(g)) return new Set();
    seen.add(g);
    const out = new Set(direct.get(g) ?? []);
    if (alwaysOn.has(g)) for (const c of universe) out.add(c);
    for (const dg of delegates.get(g) ?? [])
      if (names.has(dg)) for (const c of resolve(dg, seen)) out.add(c);
    if (seen.size === 1) req.set(g, out);
    return out;
  };
  for (const g of names) resolve(g);

  const shape = new Map<string, 'primary' | 'delegating' | 'always-on'>();
  for (const g of names)
    shape.set(
      g,
      alwaysOn.has(g) ? 'always-on' : (direct.get(g)?.size ?? 0) === 0 && (delegates.get(g)?.size ?? 0) > 0 ? 'delegating' : 'primary',
    );

  return { universe, req, shape };
}
