import ts from 'typescript';
import { walk } from '../ast.js';
import { Loaded } from '../program.js';
import { Fires } from '../extract/invokes.js';
import { BoolDomain } from '../domain/lattice.js';
import { guardBdd } from '../solve/intra.js';

// Which callbacks must turn a getter on = the coverage closure: for each hook H
// gated by getter g, the callbacks for which H is a NECESSARY carrier (fired
// directly = 'self', or via an op-scoped C/B call, or via a child hook that is
// NOT re-walk-recovered). Recovered child provenances (M→G etc.) are dropped —
// that callback is covered by the standalone child instead. This is the inverse
// of check/coverage.ts, so a getter generated from it makes those paths covered.
const FALLBACK: Record<string, string[]> = {
  M: ['G', 'Gp'], Mp: ['G', 'Gp'], TM: ['G', 'Gp'], TMp: ['G', 'Gp'],
};

// hook -> the getter names that lexically gate its emit. Uses guardBdd (which
// resolves `const enabled = state.partial.B` aliases via the checker) and takes
// the support of the reach condition. Unguarded emits (module wrapper, always-on
// Hc/Ce/TL) contribute nothing — those hooks aren't getter-gated.
function hookGetters(
  L: Loaded,
  emitHook: (n: ts.Node) => string | null,
  d: BoolDomain,
): Map<string, Set<string>> {
  const out = new Map<string, Set<string>>();
  const add = (h: string, cond: ReturnType<typeof d.atom>) => {
    for (const g of d.support(cond)) (out.get(h) ?? out.set(h, new Set()).get(h)!).add(g);
  };
  for (const file of ['/instrument/write.ts', '/instrument/visitor.ts']) {
    const sf = L.sf(file);
    walk(sf, (n) => {
      const hook = emitHook(n);
      if (!hook) return;
      let cur: ts.Node = n;
      while (cur.parent && !ts.isFunctionDeclaration(cur)) {
        const p = cur.parent;
        if (ts.isIfStatement(p) && p.thenStatement === cur)
          add(hook, guardBdd(p.expression, true, d, L.checker));
        if (ts.isBlock(p)) {
          const idx = p.statements.indexOf(cur as ts.Statement);
          for (let i = 0; i < idx; i++) {
            const st = p.statements[i];
            let exits = false;
            if (ts.isIfStatement(st))
              walk(st.thenStatement, (x) => {
                if (ts.isReturnStatement(x) || ts.isThrowStatement(x)) exits = true;
              });
            if (exits && ts.isIfStatement(st))
              add(hook, guardBdd(st.expression, false, d, L.checker));
          }
        }
        cur = p;
      }
    });
  }
  return out;
}

export interface GenResult {
  getterCallbacks: Map<string, Set<string>>; // getter -> generated callback set
  stateGatedHooks: string[]; // hooks with no lexical getter (state/always-gated)
}

export function generateGetters(
  L: Loaded,
  emitHook: (n: ts.Node) => string | null,
  fires: Fires,
  d: BoolDomain,
): GenResult {
  const hg = hookGetters(L, emitHook, d);

  // necessary-carrier callbacks of a hook (coverage closure)
  const requiredOf = (H: string): Set<string> => {
    const out = new Set<string>();
    const cbs = fires.get(H);
    if (!cbs) return out;
    for (const [c, provs] of cbs)
      for (const p of provs)
        if (p === 'self' || p === 'C' || p === 'B' || !(FALLBACK[H] ?? []).includes(p)) {
          out.add(c);
          break;
        }
    return out;
  };

  // getter(g) = ⋃ over hooks gated by g of requiredOf(hook)
  const getterCallbacks = new Map<string, Set<string>>();
  const allHooks = new Set([...fires.keys()]);
  for (const H of allHooks)
    for (const g of hg.get(H) ?? [])
      for (const c of requiredOf(H)) (getterCallbacks.get(g) ?? getterCallbacks.set(g, new Set()).get(g)!).add(c);

  const stateGatedHooks = [...allHooks].filter((h) => !(hg.get(h)?.size));
  return { getterCallbacks, stateGatedHooks };
}
