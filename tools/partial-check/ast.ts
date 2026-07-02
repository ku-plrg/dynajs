import ts from 'typescript';

export const walk = (n: ts.Node, fn: (n: ts.Node) => void): void => {
  fn(n);
  ts.forEachChild(n, (c) => walk(c, fn));
};

export const unwrap = (e: ts.Expression): ts.Expression =>
  ts.isParenthesizedExpression(e) ? unwrap(e.expression) : e;

// The getter/method behind `state.partial.<g>` (or `state.partial.literal(...)`),
// else null. `state.partial` may be aliased away by callers via constInit().
export function partialGetter(node: ts.Node): string | null {
  let x: ts.Node = node;
  if (ts.isCallExpression(x)) x = x.expression; // state.partial.literal(node)
  if (
    ts.isPropertyAccessExpression(x) &&
    ts.isPropertyAccessExpression(x.expression) &&
    x.expression.name.text === 'partial' &&
    ts.isIdentifier(x.expression.expression) &&
    x.expression.expression.text === 'state'
  )
    return x.name.text;
  return null;
}

export const isNot = (e: ts.Expression): e is ts.PrefixUnaryExpression =>
  ts.isPrefixUnaryExpression(e) && e.operator === ts.SyntaxKind.ExclamationToken;

// A `@dynajs-meta <attr> <value>` custom doc annotation.
export interface Meta {
  attr: string;
  value: string;
}
const META_RE = /@dynajs-meta\s+([A-Za-z][\w-]*)\s+([A-Za-z][\w-]*)/g;

// Read @dynajs-meta annotations from the leading comment(s) of a node.
export function readMeta(node: ts.Node, sf: ts.SourceFile): Meta[] {
  const ranges = ts.getLeadingCommentRanges(sf.text, node.getFullStart()) ?? [];
  const out: Meta[] = [];
  for (const r of ranges)
    for (const m of sf.text.slice(r.pos, r.end).matchAll(META_RE))
      out.push({ attr: m[1], value: m[2] });
  return out;
}

// Every @dynajs-meta attribute name occurring anywhere in a file (for validating
// the closed vocabulary — a typo'd attr must surface, not be silently ignored).
export function allMetaAttrs(sf: ts.SourceFile): string[] {
  return [...sf.text.matchAll(/@dynajs-meta\s+([A-Za-z][\w-]*)/g)].map((m) => m[1]);
}

// Resolve `const x = <init>` for an identifier use, via the type checker's
// symbol table (scope-correct: handles shadowing / re-declaration, unlike
// name matching). Only `const` single-assignment bindings are resolved.
export function constInit(
  id: ts.Identifier,
  checker: ts.TypeChecker,
): ts.Expression | null {
  const sym = checker.getSymbolAtLocation(id);
  const decl = sym?.valueDeclaration;
  if (
    decl &&
    ts.isVariableDeclaration(decl) &&
    decl.initializer &&
    ts.isVariableDeclarationList(decl.parent) &&
    decl.parent.flags & ts.NodeFlags.Const
  )
    return decl.initializer;
  return null;
}
