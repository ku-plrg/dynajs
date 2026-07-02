import { Bdd, Node } from './bdd.js';

// A bounded join-semilattice with meet — the generic interface the dataflow
// solvers program against (they never see BDDs directly).
export interface Lattice<T> {
  readonly bottom: T;
  readonly top: T;
  join(a: T, b: T): T; // ⊔
  meet(a: T, b: T): T; // ⊓
  leq(a: T, b: T): boolean; // partial order
  equal(a: T, b: T): boolean;
}

// The gate/reachability domain: Boolean functions of the `state.partial.*`
// atoms. A dataflow value is "the condition under which this point is reached".
//   ⊥ = FALSE (unreachable), ⊤ = TRUE (always), ⊔ = ∨ (reachable via any path),
//   ⊓ = ∧ (conjoin a branch guard), ⊑ = entailment.
// Finite height (finitely many Boolean functions over a fixed atom set) ⇒ every
// fixpoint terminates; the transfer `λx. x ∧ g` is distributive over ∨ ⇒ the
// MFP solution equals the meet-over-all-paths (MOP) solution (exact, not just
// sound).
export class BoolDomain implements Lattice<Node> {
  readonly bdd = new Bdd();
  readonly bottom = this.bdd.FALSE;
  readonly top = this.bdd.TRUE;

  atom(name: string): Node {
    return this.bdd.atom(name);
  }
  and(a: Node, b: Node): Node {
    return this.bdd.and(a, b);
  }
  or(a: Node, b: Node): Node {
    return this.bdd.or(a, b);
  }
  not(a: Node): Node {
    return this.bdd.not(a);
  }

  join(a: Node, b: Node): Node {
    return this.bdd.or(a, b);
  }
  meet(a: Node, b: Node): Node {
    return this.bdd.and(a, b);
  }
  leq(a: Node, b: Node): boolean {
    return this.bdd.implies(a, b);
  }
  equal(a: Node, b: Node): boolean {
    return a === b; // canonical: id equality
  }

  eval(n: Node, truthy: (v: string) => boolean): boolean {
    return this.bdd.eval(n, truthy);
  }
  dnf(n: Node): string {
    return this.bdd.dnf(n);
  }
  support(n: Node): Set<string> {
    return this.bdd.support(n);
  }
}
