// Statement coverage for the ExpoSE drop-in. In the dynajs-play swap ExpoSE's
// own Analyser (and its Jalangi smap/Coverage) is bypassed, so the Distributor's
// CoverageAggregator gets nothing and reports `Total Coverage: NaN%`. We rebuild
// the per-path payload it expects from dynajs's OWN instrumentation data:
//
//   { <file>: { smap: {<id>:[sl,sc,el,ec]}, branches: {<id>:bits} }, LAST_IID }
//
// `smap` is every instrumented location in the file (the coverage denominator —
// CoverageAggregator collapses ids to lines) and `branches` carries the runtime
// bits: IS_TOUCHED for executed locations, CONDITIONAL_* for the branch direction
// taken. dynajs's D$.ids / D$.files already hold the smap universe; this collects
// the executed-id set the hooks observe and merges the two on the way out.

const LAST_IID = 'LAST_IID';
const IS_TOUCHED = 0x1;
const CONDITIONAL_TRUE = 0x2;
const CONDITIONAL_FALSE = 0x4;

type Loc = [number, number, number, number];
type FilePayload = {
  smap: Record<string, Loc>;
  branches: Record<string, number>;
};

export class Coverage {
  private touched = new Set<number>();
  private decisions = new Map<number, number>();

  touch(id: number): void {
    this.touched.add(id);
  }

  // A branch executed and took `taken`. Synthetic/engine branches (id < 0: the
  // binder sentinel and pureSymbol forks) have no source location, so they only
  // matter to search ordering, never to coverage.
  decision(id: number, taken: boolean): void {
    if (id < 0) return;
    this.touched.add(id);
    const bit = taken ? CONDITIONAL_TRUE : CONDITIONAL_FALSE;
    this.decisions.set(id, (this.decisions.get(id) ?? 0) | bit);
  }

  // Assemble the payload from the runtime id->location table (D$.ids) and the
  // id->file intervals (D$.files). Both are populated only under --pos
  // persist|memory; with positions off D$.ids is empty and the payload has no
  // files — i.e. the original NaN — so the drop-in must run with positions on.
  toPayload(
    ids: Record<string, Loc>,
    files: ReadonlyArray<readonly [number, number, string]>,
  ): Record<string, FilePayload | number> {
    const fileOf = (id: number): string | undefined => {
      for (const [lo, hi, f] of files) if (id >= lo && id <= hi) return f;
      return undefined;
    };
    const out: Record<string, FilePayload | number> = {};
    const ensure = (f: string): FilePayload =>
      (out[f] as FilePayload | undefined) ??
      ((out[f] = { smap: {}, branches: {} }) as FilePayload);

    for (const idStr in ids) {
      const f = fileOf(Number(idStr));
      if (f !== undefined) ensure(f).smap[idStr] = ids[idStr];
    }
    const mark = (id: number, bits: number): void => {
      const f = fileOf(id);
      if (f === undefined) return;
      const b = ensure(f).branches;
      b[id] = (b[id] ?? 0) | bits;
    };
    for (const id of this.touched) mark(id, IS_TOUCHED);
    for (const [id, bits] of this.decisions) mark(id, IS_TOUCHED | bits);

    out[LAST_IID] = 0; // search-strategy field; CoverageAggregator skips it.
    return out;
  }
}
