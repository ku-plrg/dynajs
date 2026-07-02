import ts from 'typescript';
import { Node } from '../domain/bdd.js';
import { BoolDomain } from '../domain/lattice.js';
import { walk } from '../ast.js';
import { Loaded } from '../program.js';
import { analyzeFn, EmitHook, FnFacts } from './intra.js';

// Interprocedural gate via the Sharir–Pnueli functional (summary) approach.
//
// Each emitter function F has an intra summary (analyzeFn): the reach-condition
// of every emit/call site relative to F's entry. The interprocedural context
// ctx(F) = the condition under which F is invoked = ⋁ over its call sites of
// ctx(caller) ∧ (reach-condition of that call site). Roots (visitor handlers,
// dispatched by the walk framework — no static caller) have ctx = ⊤. The true
// condition of an emit e in F is ctx(F) ∧ g_F(e). Solved as a monotone fixpoint
// in the (finite) BDD lattice, so it terminates even if the call graph has
// cycles; for the (near-acyclic) instrumenter it converges in a couple passes.
export function interGate(
  L: Loaded,
  d: BoolDomain,
  emitHook: EmitHook,
  files: string[],
): Map<string, Node> {
  // 1. collect emitter functions: module-level emitters + visitor handler arrows
  const funcs: ts.SignatureDeclaration[] = [];
  const funcSet = new Set<ts.Node>();
  for (const file of files)
    walk(L.sf(file), (n) => {
      if (
        (ts.isFunctionDeclaration(n) && n.body) ||
        ((ts.isArrowFunction(n) || ts.isFunctionExpression(n)) &&
          ts.isPropertyAssignment(n.parent))
      ) {
        funcs.push(n);
        funcSet.add(n);
      }
    });

  // 2. intra summaries
  const facts = new Map<ts.Node, FnFacts>();
  for (const fn of funcs) facts.set(fn, analyzeFn(fn, d, L.checker, emitHook));

  // 3. call edges to functions in our set (state.walk framework dispatch is NOT
  // an edge — it re-enters visitor handlers at ⊤, matching real semantics)
  const incoming = new Map<ts.Node, { from: ts.Node; cond: Node }[]>();
  for (const fn of funcs) incoming.set(fn, []);
  const calleeOf = (call: ts.CallExpression): ts.Node | null => {
    let sym = L.checker.getSymbolAtLocation(call.expression);
    if (sym && sym.flags & ts.SymbolFlags.Alias) sym = L.checker.getAliasedSymbol(sym);
    const decl = sym?.valueDeclaration ?? sym?.declarations?.[0];
    return decl && funcSet.has(decl) ? decl : null;
  };
  for (const fn of funcs)
    for (const { call, cond } of facts.get(fn)!.calls) {
      const callee = calleeOf(call);
      if (callee) incoming.get(callee)!.push({ from: fn, cond });
    }

  // 4. context fixpoint
  const ctx = new Map<ts.Node, Node>();
  for (const fn of funcs)
    ctx.set(fn, incoming.get(fn)!.length === 0 ? d.top : d.bottom);
  for (let changed = true; changed; ) {
    changed = false;
    for (const fn of funcs) {
      if (incoming.get(fn)!.length === 0) continue; // root, fixed at ⊤
      let c = d.bottom;
      for (const { from, cond } of incoming.get(fn)!)
        c = d.join(c, d.meet(ctx.get(from)!, cond));
      if (!d.equal(c, ctx.get(fn)!)) {
        ctx.set(fn, c);
        changed = true;
      }
    }
  }

  // 5. gate(hook) = ⋁ over emits of ctx(enclosing fn) ∧ intra reach-condition
  const gate = new Map<string, Node>();
  for (const fn of funcs)
    for (const { hook, cond } of facts.get(fn)!.emits)
      gate.set(hook, d.join(gate.get(hook) ?? d.bottom, d.meet(ctx.get(fn)!, cond)));
  return gate;
}
