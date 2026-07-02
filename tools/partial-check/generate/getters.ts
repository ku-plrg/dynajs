import ts from 'typescript';
import { walk, partialAtomsIn } from '../ast.js';
import { Loaded } from '../program.js';
import { Fires } from '../extract/invokes.js';
import { loadState } from '../extract/state.js';

// Which callbacks must turn a getter on = the coverage closure: for each hook H
// gated by getter g, the callbacks for which H is a NECESSARY carrier (fired
// directly = 'self', or via an op-scoped C/B call, or via a child hook that is
// NOT re-walk-recovered). Recovered child provenances (M→G etc.) are dropped —
// that callback is covered by the standalone child instead. This is the inverse
// of check/coverage.ts, so a getter generated from it makes those paths covered.
const FALLBACK: Record<string, string[]> = {
  M: ['G', 'Gp'], Mp: ['G', 'Gp'], TM: ['G', 'Gp'], TMp: ['G', 'Gp'],
};

// hook -> the getter names that lexically gate its emit. Collects the partial
// atoms of every enclosing `if` condition whose then/else branch contains the
// emit, plus preceding early-exit guards. Unguarded emits (module wrapper,
// always-on Hc/Ce/TL) contribute nothing — those hooks aren't getter-gated.
function hookGetters(
  L: Loaded,
  emitHook: (n: ts.Node) => string | null,
): Map<string, Set<string>> {
  const out = new Map<string, Set<string>>();
  const add = (h: string, cond: ts.Expression) => {
    for (const g of partialAtomsIn(cond, L.checker))
      (out.get(h) ?? out.set(h, new Set()).get(h)!).add(g);
  };
  for (const file of ['/instrument/write.ts', '/instrument/visitor.ts']) {
    const sf = L.sf(file);
    walk(sf, (n) => {
      const hook = emitHook(n);
      if (!hook) return;
      let cur: ts.Node = n;
      while (cur.parent && !ts.isFunctionDeclaration(cur)) {
        const p = cur.parent;
        // emit is inside this if's then- or else-branch → its condition gates it
        if (ts.isIfStatement(p) && (p.thenStatement === cur || p.elseStatement === cur))
          add(hook, p.expression);
        // preceding early-exit guards in the enclosing block
        if (ts.isBlock(p)) {
          const idx = p.statements.indexOf(cur as ts.Statement);
          for (let i = 0; i < idx; i++) {
            const st = p.statements[i];
            if (!ts.isIfStatement(st)) continue;
            let exits = false;
            walk(st.thenStatement, (x) => {
              if (ts.isReturnStatement(x) || ts.isThrowStatement(x)) exits = true;
            });
            if (exits) add(hook, st.expression);
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
  req: Map<string, Set<string>>, // current getter callbacks (for the state closure)
): GenResult {
  const hg = hookGetters(L, emitHook);

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

  // getter(g) = ⋃ over hooks gated by g of requiredOf(hook)  [COVERAGE closure]
  const getterCallbacks = new Map<string, Set<string>>();
  const allHooks = new Set([...fires.keys()]);
  const addCb = (g: string, c: string) =>
    (getterCallbacks.get(g) ?? getterCallbacks.set(g, new Set()).get(g)!).add(c);
  for (const H of allHooks)
    for (const g of hg.get(H) ?? []) for (const c of requiredOf(H)) addCb(g, c);

  // STATE closure: for a `save-restore` slot the save/restore hooks' getters must
  // fire whenever a consumer does, else a nested scope clobbers the scalar. So
  // add the consumer callbacks to the save/restore getters (e.g. switchLeft ⇒
  // getter(Fe) ⊇ getterCallbacks(B) ∪ getterCallbacks(C)).
  const { protocol, touches } = loadState(L, [...allHooks]);
  const gettersOfHooks = (hooks: string[]) =>
    new Set(hooks.flatMap((h) => [...(hg.get(h) ?? [])]));
  for (const [slot, proto] of protocol) {
    if (proto !== 'save-restore') continue;
    const m = touches.get(slot);
    if (!m) continue;
    const srHooks = [...m].filter(([, r]) => r.has('save') || r.has('restore')).map(([h]) => h);
    const consumerHooks = [...m].filter(([, r]) => r.has('read') || r.has('write')).map(([h]) => h);
    // consumer callbacks = the effective getter value (generated ∪ current), so
    // state deps preserved in current (e.g. B's full binary family) are included
    const consumerCbs = new Set(
      [...gettersOfHooks(consumerHooks)].flatMap((g) => [
        ...(getterCallbacks.get(g) ?? []),
        ...(req.get(g) ?? []),
      ]),
    );
    for (const sg of gettersOfHooks(srHooks)) for (const c of consumerCbs) addCb(sg, c);
  }

  const stateGatedHooks = [...allHooks].filter((h) => !(hg.get(h)?.size));
  return { getterCallbacks, stateGatedHooks };
}
