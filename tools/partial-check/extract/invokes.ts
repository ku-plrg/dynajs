import ts from 'typescript';
import { walk } from '../ast.js';
import { Loaded } from '../program.js';

// Which analysis callbacks each runtime hook fires, and through which immediate
// provenance: 'self' (D$.analysis.X directly, or via a transparent helper),
// a child-hook name (fired via that hook — a re-walk recovery boundary), or
// 'C'/'B' (via an op-scoped condition/binary call). This is a def-use / call-
// graph reachability on the RUNTIME (hooks.ts/runtime.ts), op-aware for the
// dynamically-dispatched condition/binary specifics.
export type Fires = Map<string, Map<string, Set<string>>>;

export interface Invokes {
  fires: Fires;
  hooks: string[]; // exported functions of hooks.ts = the D$ hook surface
}

const ARITH = new Set(['+', '-', '*', '/', '%', '**']);
const CMP = new Set(['==', '!=', '===', '!==', '<', '<=', '>', '>=', 'in', 'instanceof']);
const BIT = new Set(['&', '|', '^', '<<', '>>', '>>>']);

const isDollarAnalysis = (e: ts.Expression): boolean =>
  ts.isPropertyAccessExpression(e) &&
  e.name.text === 'analysis' &&
  ts.isIdentifier(e.expression) &&
  e.expression.text === 'D$';

interface Rec {
  direct: Set<string>;
  calls: Set<string>;
  literals: Set<string>;
  tableRefs: Set<string>;
  computed: boolean;
  node: ts.Node;
}

export function loadInvokes(L: Loaded, universe: Set<string>): Invokes {
  const files = [L.sf('/runtime/hooks.ts'), L.sf('/runtime/runtime.ts')];

  // module-level object-literal tables mapping keys -> callback-name values
  const tables = new Map<string, Set<string>>();
  const condOpMap = new Map<string, string>(); // op -> callback (CONDITION_CB)
  for (const sf of files)
    walk(sf, (n) => {
      if (
        !ts.isVariableDeclaration(n) ||
        !ts.isIdentifier(n.name) ||
        !n.initializer ||
        !ts.isObjectLiteralExpression(n.initializer)
      )
        return;
      const vals = new Set<string>();
      for (const p of n.initializer.properties)
        if (
          ts.isPropertyAssignment(p) &&
          ts.isStringLiteral(p.initializer) &&
          universe.has(p.initializer.text)
        ) {
          vals.add(p.initializer.text);
          if (n.name.text === 'CONDITION_CB' && (ts.isStringLiteral(p.name) || ts.isIdentifier(p.name)))
            condOpMap.set(p.name.text, p.initializer.text);
        }
      if (vals.size) tables.set(n.name.text, vals);
    });

  // hook surface = exported functions of hooks.ts
  const hooks: string[] = [];
  for (const s of L.sf('/runtime/hooks.ts').statements)
    if (
      ts.isFunctionDeclaration(s) &&
      s.name &&
      s.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
    )
      hooks.push(s.name.text);
  const HOOKSET = new Set(hooks);

  // per-function facts
  const fns = new Map<string, Rec>();
  for (const sf of files)
    for (const s of sf.statements) {
      if (!ts.isFunctionDeclaration(s) || !s.name || !s.body) continue;
      const rec: Rec = {
        direct: new Set(), calls: new Set(), literals: new Set(),
        tableRefs: new Set(), computed: false, node: s.body,
      };
      walk(s.body, (x) => {
        if (ts.isPropertyAccessExpression(x) && isDollarAnalysis(x.expression)) rec.direct.add(x.name.text);
        if (ts.isElementAccessExpression(x) && isDollarAnalysis(x.expression)) rec.computed = true;
        if (ts.isStringLiteral(x) && universe.has(x.text)) rec.literals.add(x.text);
        if (ts.isIdentifier(x) && tables.has(x.text)) rec.tableRefs.add(x.text);
        if (ts.isCallExpression(x) && ts.isIdentifier(x.expression)) rec.calls.add(x.expression.text);
      });
      fns.set(s.name.text, rec);
    }

  // op-scoped C(op)/B(op) literal calls within a function -> callback : 'C'|'B'
  const opScoped = (name: string): Map<string, string> => {
    const out = new Map<string, string>();
    walk(fns.get(name)!.node, (x) => {
      if (
        !ts.isCallExpression(x) || !ts.isIdentifier(x.expression) ||
        x.arguments.length < 2 || !ts.isStringLiteral(x.arguments[1])
      )
        return;
      const callee = x.expression.text;
      const op = (x.arguments[1] as ts.StringLiteral).text;
      if (callee === 'C') {
        out.set('condition', 'C');
        if (condOpMap.has(op)) out.set(condOpMap.get(op)!, 'C');
      } else if (callee === 'B') {
        out.set('binaryPre', 'B'); out.set('binary', 'B');
        if (ARITH.has(op)) { out.set('arithmeticBinaryPre', 'B'); out.set('arithmeticBinary', 'B'); }
        else if (CMP.has(op)) { out.set('comparisonBinaryPre', 'B'); out.set('comparisonBinary', 'B'); }
        else if (BIT.has(op)) { out.set('bitwiseBinaryPre', 'B'); out.set('bitwiseBinary', 'B'); }
      }
    });
    return out;
  };

  // callbacks a child hook fires (its whole closure) — delegates to
  // firesWithProv, which owns the recursion guard (must NOT pre-add `name`)
  const allInvokes = (name: string, seen: Set<string>): Set<string> =>
    new Set(firesWithProv(name, seen).keys());

  const firesCache = new Map<string, Map<string, Set<string>>>();
  function firesWithProv(name: string, seen = new Set<string>()): Map<string, Set<string>> {
    if (firesCache.has(name)) return firesCache.get(name)!;
    if (seen.has(name) || !fns.has(name)) return new Map();
    seen.add(name);
    const out = new Map<string, Set<string>>();
    const add = (c: string, prov: string) => (out.get(c) ?? out.set(c, new Set()).get(c)!).add(prov);
    const r = fns.get(name)!;
    for (const c of r.direct) add(c, 'self');
    if (r.computed) {
      for (const l of r.literals) add(l, 'self');
      for (const t of r.tableRefs) for (const v of tables.get(t)!) add(v, 'self');
    }
    if (name !== 'C' && name !== 'B') for (const [c, via] of opScoped(name)) add(c, via);
    for (const callee of r.calls) {
      if (callee === 'C' || callee === 'B') continue; // handled op-aware
      if (HOOKSET.has(callee)) {
        for (const c of allInvokes(callee, seen)) add(c, callee); // recovery boundary
      } else if (fns.has(callee)) {
        for (const [c, provs] of firesWithProv(callee, seen)) for (const p of provs) add(c, p);
      }
    }
    if (seen.size === 1) firesCache.set(name, out);
    return out;
  }

  const fires: Fires = new Map();
  for (const h of hooks) if (fns.has(h)) fires.set(h, firesWithProv(h));
  return { fires, hooks };
}
