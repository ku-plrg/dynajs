// Reduced Ordered Binary Decision Diagram (ROBDD).
//
// The gate/reachability domain is the free Boolean algebra over the
// `state.partial.<g>` atoms (predicate abstraction). BDDs give a *canonical*
// representation: hash-consing (the `unique` table) + the reduction rule make
// structurally-equal formulas share the same node id, so equality, lattice
// `leq`, and fixpoint convergence are O(1) id comparisons, and `eval` is a
// single root-to-leaf walk. Variable ordering only affects size, not
// correctness; we intern variables in first-seen order.

export type Node = number; // 0 = FALSE, 1 = TRUE, >= 2 = decision node

export class Bdd {
  readonly FALSE: Node = 0;
  readonly TRUE: Node = 1;

  private levelOf = new Map<string, number>();
  private varAt: string[] = [];
  // decision nodes, parallel arrays indexed by (id - 2)
  private nVar: number[] = [];
  private nLo: Node[] = [];
  private nHi: Node[] = [];
  private unique = new Map<string, Node>();
  private iteMemo = new Map<string, Node>();

  private level(n: Node): number {
    return n < 2 ? Number.MAX_SAFE_INTEGER : this.nVar[n - 2];
  }
  private lo(n: Node): Node {
    return this.nLo[n - 2];
  }
  private hi(n: Node): Node {
    return this.nHi[n - 2];
  }

  private varLevel(name: string): number {
    let lv = this.levelOf.get(name);
    if (lv === undefined) {
      lv = this.varAt.length;
      this.levelOf.set(name, lv);
      this.varAt.push(name);
    }
    return lv;
  }

  // Make (or reuse) a reduced node: no redundant test (lo === hi collapses),
  // no duplicate node (hash-consed).
  private mk(level: number, lo: Node, hi: Node): Node {
    if (lo === hi) return lo;
    const key = `${level}:${lo}:${hi}`;
    const found = this.unique.get(key);
    if (found !== undefined) return found;
    const id = this.nVar.length + 2;
    this.nVar.push(level);
    this.nLo.push(lo);
    this.nHi.push(hi);
    this.unique.set(key, id);
    return id;
  }

  atom(name: string): Node {
    return this.mk(this.varLevel(name), this.FALSE, this.TRUE);
  }

  // If-then-else: the single primitive; and/or/not derive from it (Shannon
  // expansion on the topmost variable, memoized).
  private ite(f: Node, g: Node, h: Node): Node {
    if (f === this.TRUE) return g;
    if (f === this.FALSE) return h;
    if (g === h) return g;
    if (g === this.TRUE && h === this.FALSE) return f;
    const key = `${f},${g},${h}`;
    const memo = this.iteMemo.get(key);
    if (memo !== undefined) return memo;
    const v = Math.min(this.level(f), this.level(g), this.level(h));
    const co = (n: Node, hi: boolean): Node =>
      this.level(n) === v ? (hi ? this.hi(n) : this.lo(n)) : n;
    const r = this.mk(
      v,
      this.ite(co(f, false), co(g, false), co(h, false)),
      this.ite(co(f, true), co(g, true), co(h, true)),
    );
    this.iteMemo.set(key, r);
    return r;
  }

  and(a: Node, b: Node): Node {
    return this.ite(a, b, this.FALSE);
  }
  or(a: Node, b: Node): Node {
    return this.ite(a, this.TRUE, b);
  }
  not(a: Node): Node {
    return this.ite(a, this.FALSE, this.TRUE);
  }

  // f entails g  ⟺  f ∧ ¬g is unsatisfiable
  implies(f: Node, g: Node): boolean {
    return this.and(f, this.not(g)) === this.FALSE;
  }

  // Evaluate under an assignment: `truthy(v)` = is atom v true.
  eval(n: Node, truthy: (v: string) => boolean): boolean {
    while (n >= 2) n = truthy(this.varAt[this.nVar[n - 2]]) ? this.hi(n) : this.lo(n);
    return n === this.TRUE;
  }

  // Readable sum-of-products rendering (for reports; not minimal).
  dnf(n: Node): string {
    if (n === this.FALSE) return 'false';
    if (n === this.TRUE) return 'true';
    const terms: string[] = [];
    const go = (m: Node, acc: string[]): void => {
      if (m === this.FALSE) return;
      if (m === this.TRUE) {
        terms.push(acc.length ? acc.join('&') : 'true');
        return;
      }
      const v = this.varAt[this.nVar[m - 2]];
      go(this.lo(m), [...acc, '!' + v]);
      go(this.hi(m), [...acc, v]);
    };
    go(n, []);
    return terms.join(' | ');
  }

  // Atoms mentioned by a formula (for reporting).
  support(n: Node): Set<string> {
    const out = new Set<string>();
    const seen = new Set<Node>();
    const go = (m: Node): void => {
      if (m < 2 || seen.has(m)) return;
      seen.add(m);
      out.add(this.varAt[this.nVar[m - 2]]);
      go(this.lo(m));
      go(this.hi(m));
    };
    go(n);
    return out;
  }
}
