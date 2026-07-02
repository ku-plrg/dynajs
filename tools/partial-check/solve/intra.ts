import ts from 'typescript';
import { Node } from '../domain/bdd.js';
import { BoolDomain } from '../domain/lattice.js';
import { constInit, isNot, partialGetter, unwrap } from '../ast.js';

// An emit site classifier: node -> hook short name (e.g. LOG.GET_FIELD -> "G").
export type EmitHook = (node: ts.Node) => string | null;

export interface EmitSite {
  node: ts.Node;
  hook: string;
  cond: Node;
}
export interface CallSite {
  call: ts.CallExpression;
  cond: Node;
}
// Intraprocedural summary of one function: the reach-condition of each emit and
// each call site, relative to the function's entry.
export interface FnFacts {
  emits: EmitSite[];
  calls: CallSite[];
}

// BDD of the `state.partial.*` formula of `expr` under truth value `want`.
// `const` aliases are resolved via the checker; non-partial subexpressions are
// unconstrained (⊤ / ⊥ appropriately), which is the sound over-approximation.
export function guardBdd(
  expr: ts.Expression,
  want: boolean,
  d: BoolDomain,
  checker: ts.TypeChecker,
): Node {
  expr = unwrap(expr);
  const g = partialGetter(expr);
  if (g) return want ? d.atom(g) : d.not(d.atom(g));
  if (ts.isIdentifier(expr)) {
    const init = constInit(expr, checker);
    if (init) return guardBdd(init, want, d, checker);
  }
  if (isNot(expr)) return guardBdd(expr.operand as ts.Expression, !want, d, checker);
  if (ts.isBinaryExpression(expr)) {
    const op = expr.operatorToken.kind;
    const AND = ts.SyntaxKind.AmpersandAmpersandToken;
    const OR = ts.SyntaxKind.BarBarToken;
    if (op === AND || op === OR) {
      const l = guardBdd(expr.left, want, d, checker);
      const r = guardBdd(expr.right, want, d, checker);
      return (op === AND) === want ? d.and(l, r) : d.or(l, r);
    }
  }
  return d.top; // non-partial: no constraint
}

// Forward syntax-directed reach-condition analysis. For structured (reducible)
// code this is exactly the CFG MFP solution: `cin` threads through a block,
// splits at each guard (⊓ guard / ⊓ ¬guard), joins (⊔) at merges, and becomes
// ⊥ after return/throw (fall-through unreachable). Records the reach-condition
// at every emit site. Inline arrow thunks are treated as synchronously inlined
// (they carry the reach-condition of their definition site).
export function analyzeFn(
  fn: ts.SignatureDeclaration,
  d: BoolDomain,
  checker: ts.TypeChecker,
  emitHook: EmitHook,
): FnFacts {
  const emits = new Map<ts.Node, Node>();
  const calls: CallSite[] = [];
  const record = (n: ts.Node, cond: Node) =>
    emits.set(n, d.join(emits.get(n) ?? d.bottom, cond));

  const expr = (node: ts.Node, cond: Node): void => {
    const hook = emitHook(node);
    if (hook) {
      record(node, cond);
      return;
    }
    if (ts.isCallExpression(node)) {
      // record the call site (callee resolution + edge happen in inter.ts),
      // then descend into callee and args at the same condition
      calls.push({ call: node, cond });
      expr(node.expression, cond);
      for (const a of node.arguments) expr(a, cond);
      return;
    }
    if (ts.isConditionalExpression(node)) {
      expr(node.condition, cond);
      expr(node.whenTrue, d.meet(cond, guardBdd(node.condition, true, d, checker)));
      expr(node.whenFalse, d.meet(cond, guardBdd(node.condition, false, d, checker)));
      return;
    }
    if (
      ts.isBinaryExpression(node) &&
      (node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken ||
        node.operatorToken.kind === ts.SyntaxKind.BarBarToken)
    ) {
      const isAnd = node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken;
      expr(node.left, cond);
      expr(node.right, d.meet(cond, guardBdd(node.left, isAnd, d, checker)));
      return;
    }
    if (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
      if (ts.isBlock(node.body)) stmt(node.body, cond);
      else expr(node.body, cond);
      return;
    }
    ts.forEachChild(node, (c) => expr(c, cond));
  };

  // returns the reach-condition of the fall-through successor
  const stmt = (s: ts.Node, cin: Node): Node => {
    if (ts.isBlock(s)) {
      let c = cin;
      for (const st of s.statements) c = stmt(st, c);
      return c;
    }
    if (ts.isIfStatement(s)) {
      expr(s.expression, cin);
      const thenOut = stmt(s.thenStatement, d.meet(cin, guardBdd(s.expression, true, d, checker)));
      const elseIn = d.meet(cin, guardBdd(s.expression, false, d, checker));
      const elseOut = s.elseStatement ? stmt(s.elseStatement, elseIn) : elseIn;
      return d.join(thenOut, elseOut);
    }
    if (ts.isReturnStatement(s) || ts.isThrowStatement(s)) {
      if (s.expression) expr(s.expression, cin);
      return d.bottom;
    }
    if (ts.isBreakStatement(s) || ts.isContinueStatement(s)) return d.bottom;
    if (ts.isExpressionStatement(s)) {
      expr(s.expression, cin);
      return cin;
    }
    if (ts.isVariableStatement(s)) {
      expr(s.declarationList, cin);
      return cin;
    }
    // loops / switch / try / labeled: guards are never partial-atoms, so bodies
    // are reachable under `cin` and fall-through stays `cin` (sound).
    if (
      ts.isForStatement(s) || ts.isForInStatement(s) || ts.isForOfStatement(s) ||
      ts.isWhileStatement(s) || ts.isDoStatement(s)
    ) {
      ts.forEachChild(s, (c) => (ts.isStatement(c) ? stmt(c, cin) : expr(c, cin)));
      return cin;
    }
    if (ts.isSwitchStatement(s)) {
      expr(s.expression, cin);
      for (const cl of s.caseBlock.clauses) {
        let c = cin;
        for (const st of cl.statements) c = stmt(st, c);
      }
      return cin;
    }
    if (ts.isTryStatement(s)) {
      stmt(s.tryBlock, cin);
      if (s.catchClause) stmt(s.catchClause.block, cin);
      if (s.finallyBlock) return stmt(s.finallyBlock, cin);
      return cin;
    }
    if (ts.isLabeledStatement(s)) return stmt(s.statement, cin);
    // nested function/class declarations: not part of this function's flow
    if (ts.isFunctionDeclaration(s) || ts.isClassDeclaration(s)) return cin;
    // fallback: scan children for emits under cin, don't thread
    ts.forEachChild(s, (c) => (ts.isStatement(c) ? stmt(c, cin) : expr(c, cin)));
    return cin;
  };

  if (fn.body) {
    if (ts.isBlock(fn.body)) stmt(fn.body, d.top);
    else expr(fn.body as ts.Expression, d.top);
  }
  const emitSites: EmitSite[] = [];
  for (const [node, cond] of emits)
    emitSites.push({ node, hook: emitHook(node)!, cond });
  return { emits: emitSites, calls };
}
