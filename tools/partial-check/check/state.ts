import ts from 'typescript';
import { Node } from '../domain/bdd.js';
import { BoolDomain } from '../domain/lattice.js';
import { allMetaAttrs, readMeta, walk } from '../ast.js';
import { Loaded } from '../program.js';

// Closed @dynajs-meta vocabulary; unknown attr/value is an error.
const META_VOCAB: Record<string, string[]> = {
  state: ['balanced-stack', 'set-drain', 'save-restore', 'scratch'],
};

const BARE_STATE = ['returnStack', 'switchStack'];
const RT_STATE = ['uncaughtException', 'switchLeft', 'lastComputedValue'];

type Role = 'push' | 'pop' | 'read' | 'write' | 'save' | 'restore';

export interface StateResult {
  metaErrors: string[];
  findings: string[];
  rows: string[]; // per-slot summary (for display)
}

export function checkState(
  L: Loaded,
  d: BoolDomain,
  gate: Map<string, Node>,
  hooks: string[],
): StateResult {
  const metaErrors: string[] = [];
  const findings: string[] = [];
  const rows: string[] = [];

  // 1. @dynajs-meta state protocols + vocabulary validation (runtime.ts)
  const rt = L.sf('/runtime/runtime.ts');
  const protocol = new Map<string, string>(); // slot -> protocol
  for (const a of allMetaAttrs(rt))
    if (!(a in META_VOCAB))
      metaErrors.push(`unknown @dynajs-meta attribute '${a}' (valid: ${Object.keys(META_VOCAB).join(', ')})`);
  walk(rt, (n) => {
    let slot: string | undefined;
    if (ts.isVariableStatement(n)) {
      const dcl = n.declarationList.declarations[0];
      if (dcl && ts.isIdentifier(dcl.name)) slot = dcl.name.text;
    } else if (ts.isPropertyAssignment(n) && ts.isIdentifier(n.name)) {
      slot = n.name.text;
    } else return;
    for (const { attr, value } of readMeta(n, rt))
      if (attr === 'state') {
        if (!META_VOCAB.state.includes(value))
          metaErrors.push(`unknown state protocol '${value}' on '${slot}' (valid: ${META_VOCAB.state.join(', ')})`);
        else protocol.set(slot!, value);
      }
  });

  // 2. state def-use: which hook touches which slot, in which role
  const touches = new Map<string, Map<string, Set<Role>>>(); // slot -> hook -> roles
  const touch = (slot: string, hook: string, role: Role) => {
    const m = touches.get(slot) ?? touches.set(slot, new Map()).get(slot)!;
    (m.get(hook) ?? m.set(hook, new Set()).get(hook)!).add(role);
  };
  const hookSet = new Set(hooks);
  const hooksSf = L.sf('/runtime/hooks.ts');
  for (const s of hooksSf.statements) {
    if (!ts.isFunctionDeclaration(s) || !s.name || !s.body || !hookSet.has(s.name.text)) continue;
    const H = s.name.text;
    walk(s.body, (x) => {
      // switch save/restore helpers
      if (ts.isCallExpression(x) && ts.isIdentifier(x.expression)) {
        if (x.expression.text === 'pushSwitchLeft') { touch('switchStack', H, 'push'); touch('switchLeft', H, 'save'); }
        if (x.expression.text === 'popSwitchLeft') { touch('switchStack', H, 'pop'); touch('switchLeft', H, 'restore'); }
      }
      // bare returnStack / switchStack (skip the .name position of `x.pop`)
      if (
        ts.isIdentifier(x) && BARE_STATE.includes(x.text) &&
        !(ts.isPropertyAccessExpression(x.parent) && x.parent.name === x)
      ) {
        const p = x.parent;
        if (ts.isPropertyAccessExpression(p) && ts.isCallExpression(p.parent) && p.parent.expression === p)
          touch(x.text, H, p.name.text === 'push' ? 'push' : p.name.text === 'pop' ? 'pop' : 'read');
        else if (
          (ts.isElementAccessExpression(p) || ts.isPropertyAccessExpression(p)) && p.expression === x &&
          ts.isBinaryExpression(p.parent) && p.parent.left === p &&
          p.parent.operatorToken.kind === ts.SyntaxKind.EqualsToken
        )
          touch(x.text, H, 'write');
        else touch(x.text, H, 'read');
      }
      // rt.<field>
      if (
        ts.isPropertyAccessExpression(x) && ts.isIdentifier(x.expression) &&
        x.expression.text === 'rt' && RT_STATE.includes(x.name.text)
      ) {
        const w = ts.isBinaryExpression(x.parent) && x.parent.left === x &&
          x.parent.operatorToken.kind === ts.SyntaxKind.EqualsToken;
        touch(x.name.text, H, w ? 'write' : 'read');
      }
    });
  }

  // 3. per-slot typestate invariant, using the BDD gates
  const gateOf = (H: string) => gate.get(H) ?? d.bottom;
  const orGates = (pred: (roles: Set<Role>) => boolean, m: Map<string, Set<Role>>) =>
    [...m].filter(([, r]) => pred(r)).reduce((acc, [H]) => d.join(acc, gateOf(H)), d.bottom);

  for (const slot of [...BARE_STATE, ...RT_STATE]) {
    const m = touches.get(slot);
    if (!m) continue;
    const summary = [...m].map(([H, r]) => `${H}(${[...r].join(',')})`).join(' ');
    const proto = protocol.get(slot);
    rows.push(`${slot} [${proto ?? '???'}]: ${summary}`);
    if (!proto) { findings.push(`UNDECLARED shared state '${slot}' — add @dynajs-meta state <protocol>`); continue; }
    if (proto === 'scratch') continue;
    if (proto === 'balanced-stack') {
      const push = orGates((r) => r.has('push'), m), pop = orGates((r) => r.has('pop'), m);
      if (!d.equal(push, pop))
        findings.push(`${slot}: push-gate {${d.dnf(push)}} != pop-gate {${d.dnf(pop)}} — stack can desync`);
    } else if (proto === 'save-restore') {
      const consumer = d.join(orGates((r) => r.has('read'), m), orGates((r) => r.has('write'), m));
      const saveRestore = d.join(orGates((r) => r.has('save'), m), orGates((r) => r.has('restore'), m));
      if (!d.leq(consumer, saveRestore))
        findings.push(`${slot}: consumed under {${d.dnf(d.meet(consumer, d.not(saveRestore)))}} but not save/restored there — nested-scope clobber`);
    } else if (proto === 'set-drain') {
      const writer = orGates((r) => r.has('write'), m);
      const readers = orGates((r) => r.has('read'), m);
      // an always-emitted writer is a clearer that unconditionally drains
      const alwaysClear = [...m].some(([H, r]) => r.has('write') && d.equal(gateOf(H), d.top));
      const drain = alwaysClear ? d.top : readers;
      if (!d.leq(writer, drain))
        findings.push(`${slot}: written under {${d.dnf(d.meet(writer, d.not(drain)))}} with no drainer — can go stale`);
    }
  }

  return { metaErrors, findings, rows };
}
