import ts from 'typescript';
import { allMetaAttrs, readMeta, walk } from '../ast.js';
import { Loaded } from '../program.js';

// Closed @dynajs-meta vocabulary; unknown attr/value is an error.
export const META_VOCAB: Record<string, string[]> = {
  state: ['balanced-stack', 'set-drain', 'save-restore', 'scratch'],
};

export const BARE_STATE = ['returnStack', 'switchStack'];
export const RT_STATE = ['uncaughtException', 'switchLeft', 'lastComputedValue'];
export const SLOTS = [...BARE_STATE, ...RT_STATE];

export type Role = 'push' | 'pop' | 'read' | 'write' | 'save' | 'restore';

export interface StateModel {
  protocol: Map<string, string>; // slot -> @dynajs-meta protocol
  touches: Map<string, Map<string, Set<Role>>>; // slot -> hook -> roles
  metaErrors: string[];
}

// Parse the @dynajs-meta state protocols (runtime.ts) and the shared-state
// def-use over the hook bodies (hooks.ts). Shared by the checker and generator.
export function loadState(L: Loaded, hooks: string[]): StateModel {
  const metaErrors: string[] = [];
  const protocol = new Map<string, string>();

  const rt = L.sf('/runtime/runtime.ts');
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

  const touches = new Map<string, Map<string, Set<Role>>>();
  const touch = (slot: string, hook: string, role: Role) => {
    const m = touches.get(slot) ?? touches.set(slot, new Map()).get(slot)!;
    (m.get(hook) ?? m.set(hook, new Set()).get(hook)!).add(role);
  };
  const hookSet = new Set(hooks);
  for (const s of L.sf('/runtime/hooks.ts').statements) {
    if (!ts.isFunctionDeclaration(s) || !s.name || !s.body || !hookSet.has(s.name.text)) continue;
    const H = s.name.text;
    walk(s.body, (x) => {
      if (ts.isCallExpression(x) && ts.isIdentifier(x.expression)) {
        if (x.expression.text === 'pushSwitchLeft') { touch('switchStack', H, 'push'); touch('switchLeft', H, 'save'); }
        if (x.expression.text === 'popSwitchLeft') { touch('switchStack', H, 'pop'); touch('switchLeft', H, 'restore'); }
      }
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

  return { protocol, touches, metaErrors };
}
