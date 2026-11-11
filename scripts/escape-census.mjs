// Census of where the final built-in models leave the hooks.
//
// Starting from every INTRINSICS.*.ts model in analyses/flow/spec, follow the
// imports (generated files that re-export a *.manual.ts are followed into the
// manual model) and report, per model function, the two ways a model can step
// outside the Table I hooks:
//
//   data   `$.default(v, [operands])` with a non-empty operand list: the value
//          is computed natively and the analysis sees only the default transfer
//   branch `$.value(x)` that decides native control flow (an if/while/for/?:
//          test, or a &&/|| operand) without going through `$.condition`, so
//          the branch is not observed (no path constraint for concolic)
//
// `$.value` uses that are neither (e.g. feeding a native computation that is
// then wrapped by `$.default`, or reading a loop bound) are counted as `other`.
//
// usage: node scripts/escape-census.mjs [--list]
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const SPEC = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../analyses/flow/spec");
const LIST = process.argv.includes("--list");

const roots = fs.readdirSync(SPEC).filter((f) => /^INTRINSICS\..*\.ts$/.test(f) && !f.endsWith(".manual.ts"));

/** parse a model file (cached) */
const cache = new Map();
function load(file) {
  if (!cache.has(file)) {
    const text = fs.readFileSync(path.join(SPEC, file), "utf8");
    cache.set(file, ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true));
  }
  return cache.get(file);
}

/** files a model file depends on: its imports and `export * from` targets */
function deps(file) {
  const out = [];
  for (const st of load(file).statements) {
    const spec =
      (ts.isImportDeclaration(st) || ts.isExportDeclaration(st)) && st.moduleSpecifier
        ? st.moduleSpecifier.text
        : null;
    if (!spec || !spec.startsWith("./")) continue;
    const f = spec.slice(2).replace(/\.js$/, ".ts");
    if (fs.existsSync(path.join(SPEC, f))) out.push(f);
  }
  return out;
}

function closure(root) {
  const seen = new Set([root]);
  const work = [root];
  while (work.length) for (const d of deps(work.pop())) if (!seen.has(d)) seen.add(d), work.push(d);
  return seen;
}

const isDollarCall = (n, name) =>
  ts.isCallExpression(n) &&
  ts.isPropertyAccessExpression(n.expression) &&
  ts.isIdentifier(n.expression.expression) &&
  n.expression.expression.text === "$" &&
  n.expression.name.text === name;

/** whether node sits in the test of a native branch (not wrapped by $.condition) */
function branchContext(node) {
  for (let child = node, p = node.parent; p; child = p, p = p.parent) {
    if (isDollarCall(p, "condition") || isDollarCall(p, "default")) return false;
    if ((ts.isIfStatement(p) || ts.isWhileStatement(p) || ts.isDoStatement(p)) && p.expression === child) return true;
    if (ts.isForStatement(p) && p.condition === child) return true;
    if (ts.isConditionalExpression(p) && p.condition === child) return true;
    if (ts.isBinaryExpression(p) &&
        [ts.SyntaxKind.AmpersandAmpersandToken, ts.SyntaxKind.BarBarToken].includes(p.operatorToken.kind))
      return true;
    if (ts.isStatement(p) || ts.isFunctionLike(p)) return false;
  }
  return false;
}

/** escape sites in one model file */
const sitesCache = new Map();
function sites(file) {
  if (sitesCache.has(file)) return sitesCache.get(file);
  const sf = load(file);
  const found = [];
  const line = (n) => sf.getLineAndCharacterOfPosition(n.getStart()).line + 1;
  const snippet = (n) => {
    let s = n;
    while (s.parent && !ts.isStatement(s)) s = s.parent;
    return s.getText().replace(/\s+/g, " ").slice(0, 140);
  };
  // variables holding an unlifted value: `let u = $.value(x)` / `u = $.value(x)`
  // (also `$.value(x).charCodeAt(0)` and the like); a branch on such a
  // variable is a branch escape at the branch, not at the `$.value` call
  const unliftedVars = new Set();
  const holdsValue = (e) => {
    let hit = false;
    (function v(n) {
      if (isDollarCall(n, "value") && !isDollarCall(n.arguments[0], "condition")) hit = true;
      else if (!isDollarCall(n, "default") && !isDollarCall(n, "condition")) ts.forEachChild(n, v);
    })(e);
    return hit;
  };
  (function bind(n) {
    if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.initializer && holdsValue(n.initializer))
      unliftedVars.add(n.name.text);
    if (ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
        ts.isIdentifier(n.left) && holdsValue(n.right))
      unliftedVars.add(n.left.text);
    ts.forEachChild(n, bind);
  })(sf);
  const isBound = (n) =>
    (ts.isVariableDeclaration(n.parent) && n.parent.name === n) ||
    (ts.isBinaryExpression(n.parent) && n.parent.left === n &&
      n.parent.operatorToken.kind === ts.SyntaxKind.EqualsToken);

  (function visit(n) {
    if (isDollarCall(n, "default")) {
      const ops = n.arguments[1];
      if (ops && ts.isArrayLiteralExpression(ops) && ops.elements.length > 0)
        found.push({ kind: "data", line: line(n), text: snippet(n) });
    } else if (isDollarCall(n, "value") && !isDollarCall(n.arguments[0], "condition")) {
      found.push({ kind: branchContext(n) ? "branch" : "other", line: line(n), text: snippet(n) });
    } else if (ts.isIdentifier(n) && unliftedVars.has(n.text) && !isBound(n) && branchContext(n)) {
      found.push({ kind: "branch", line: line(n), text: snippet(n) });
    }
    ts.forEachChild(n, visit);
  })(sf);
  // one branch site per branch statement/expression, not per variable use
  const seen = new Set();
  const dedup = found.filter((x) => x.kind !== "branch" || (!seen.has(x.line) && seen.add(x.line)));
  sitesCache.set(file, dedup);
  return dedup;
}

// per file: built-ins reaching it, and its sites
const reach = new Map();
for (const r of roots) for (const f of closure(r)) (reach.get(f) ?? reach.set(f, new Set()).get(f)).add(r);

const name = (f) => f.replace(/^INTRINSICS\./, "").replace(/\.ts$/, "");
const rows = [...reach.keys()]
  .map((f) => {
    const s = sites(f);
    const c = (k) => s.filter((x) => x.kind === k).length;
    return { f, n: reach.get(f).size, data: c("data"), branch: c("branch"), other: c("other"), s };
  })
  .filter((r) => r.data + r.branch + r.other > 0)
  .sort((a, b) => b.n - a.n || a.f.localeCompare(b.f));

console.log(`${roots.length} built-in models, ${reach.size} model files reachable`);
console.log(`${"built-ins".padStart(9)} ${"data".padStart(5)} ${"branch".padStart(6)} ${"other".padStart(5)}  model`);
for (const r of rows)
  console.log(`${String(r.n).padStart(9)} ${String(r.data).padStart(5)} ${String(r.branch).padStart(6)} ${String(r.other).padStart(5)}  ${name(r.f)}`);
if (LIST)
  for (const r of rows) {
    console.log(`\n## ${name(r.f)}  (reached by ${r.n})`);
    for (const x of r.s) console.log(`  ${x.kind.padEnd(6)} L${x.line}: ${x.text}`);
  }
