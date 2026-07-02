import { Node } from '../domain/bdd.js';
import { BoolDomain } from '../domain/lattice.js';
import { Loaded } from '../program.js';
import { loadState, Role, SLOTS } from '../extract/state.js';

export interface StateResult {
  metaErrors: string[];
  findings: string[];
  rows: string[]; // per-slot summary (for display)
}

// P2 shared-state invariants, evaluated at callback singletons (like P1 coverage)
// so getter-value coupling is visible: a hook is "emitted at c" iff its gate BDD
// is satisfied when getter g is on ⟺ c ∈ req(g). (An earlier version compared
// gate BDDs over getter *atoms*, which couldn't see that e.g. getter(Fe) and
// getter(B) share a callback — so it missed generator fixes.)
export function checkState(
  L: Loaded,
  d: BoolDomain,
  gate: Map<string, Node>,
  req: Map<string, Set<string>>,
  universe: Set<string>,
  hooks: string[],
): StateResult {
  const { protocol, touches, metaErrors } = loadState(L, hooks);
  const findings: string[] = [];
  const rows: string[] = [];

  const emittedAt = (hook: string, c: string): boolean => {
    const g = gate.get(hook);
    return g !== undefined && d.eval(g, (getter) => req.get(getter)?.has(c) ?? false);
  };
  const anyAt = (hooksInRole: string[], c: string) => hooksInRole.some((h) => emittedAt(h, c));
  const inRole = (m: Map<string, Set<Role>>, ...roles: Role[]) =>
    [...m].filter(([, r]) => roles.some((role) => r.has(role))).map(([h]) => h);

  for (const slot of SLOTS) {
    const m = touches.get(slot);
    if (!m) continue;
    const proto = protocol.get(slot);
    rows.push(`${slot} [${proto ?? '???'}]: ${[...m].map(([h, r]) => `${h}(${[...r].join(',')})`).join(' ')}`);
    if (!proto) {
      findings.push(`UNDECLARED shared state '${slot}' — add @dynajs-meta state <protocol>`);
      continue;
    }
    if (proto === 'scratch') continue;

    const push = inRole(m, 'push'), pop = inRole(m, 'pop');
    const save = inRole(m, 'save', 'restore');
    const consumer = inRole(m, 'read', 'write');
    const writer = inRole(m, 'write'), reader = inRole(m, 'read');
    const alwaysClearer = writer.some((h) => d.equal(gate.get(h) ?? d.bottom, d.top));

    const bad: string[] = [];
    for (const c of universe) {
      if (proto === 'balanced-stack') {
        if (anyAt(push, c) !== anyAt(pop, c)) bad.push(c);
      } else if (proto === 'save-restore') {
        if (anyAt(consumer, c) && !anyAt(save, c)) bad.push(c);
      } else if (proto === 'set-drain') {
        if (anyAt(writer, c) && !anyAt(reader, c) && !alwaysClearer) bad.push(c);
      }
    }
    if (bad.length) {
      const verb = proto === 'balanced-stack' ? 'push/pop desync' : proto === 'save-restore' ? 'consumed but not save/restored (nested-scope clobber)' : 'written but not drained';
      findings.push(`${slot} [${proto}]: ${verb} under {${bad.slice(0, 6).join(',')}${bad.length > 6 ? ',…' : ''}}`);
    }
  }

  return { metaErrors, findings, rows };
}
