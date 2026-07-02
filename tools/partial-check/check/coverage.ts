import { Node } from '../domain/bdd.js';
import { BoolDomain } from '../domain/lattice.js';
import { Fires } from '../extract/invokes.js';

// When a hook's gate is false its fallback re-walks children; these child hooks
// re-instrument the walked sub-tree, recovering their callbacks under their own
// gate. M/Mp/TM/TMp re-walk the callee/tag (a member get -> G/Gp). Verbatim
// fallbacks recover nothing (default []).
const FALLBACK: Record<string, string[]> = {
  M: ['G', 'Gp'], Mp: ['G', 'Gp'], TM: ['G', 'Gp'], TMp: ['G', 'Gp'],
};

export interface Finding {
  callback: string;
  carriers: { hook: string; via: string[] }[]; // uncovered firing paths
}

// P1: an analysis implementing only callback c must fire c at the same events as
// full mode. c is missed via a (hook H, provenance) path iff H is not emitted at
// S={c} AND its fallback doesn't recover that path. Gate emission is decided by
// evaluating the BDD gate with getter g on ⟺ c ∈ req(g).
export function coverage(
  d: BoolDomain,
  gate: Map<string, Node>,
  req: Map<string, Set<string>>,
  inv: Fires,
): Finding[] {
  const emitted = (hook: string, c: string): boolean => {
    const g = gate.get(hook);
    return g !== undefined && d.eval(g, (getter) => req.get(getter)?.has(c) ?? false);
  };
  const covered = (c: string, H: string, prov: string): boolean =>
    emitted(H, c) || ((FALLBACK[H] ?? []).includes(prov) && emitted(prov, c));

  const byCb = new Map<string, { hook: string; via: string[] }[]>();
  for (const [H, callbacks] of inv)
    for (const [c, provs] of callbacks) {
      const bad = [...provs].filter((p) => !covered(c, H, p));
      if (bad.length) (byCb.get(c) ?? byCb.set(c, []).get(c)!).push({ hook: H, via: bad });
    }
  return [...byCb.keys()]
    .sort()
    .map((c) => ({ callback: c, carriers: byCb.get(c)! }));
}
