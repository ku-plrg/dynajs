import type { Analysis } from "@/types/analysis.js";
import { FlowAnalysis, type Valued, type InfoDomain, type CallPolicy, type Site } from "@/model/index.js";
import { installPrelude } from "./prelude.js";

declare const D$: { analysis: Analysis } & Record<string, any>;

installPrelude();

// NOTE maybe we should extend TaintInfo = { ... } | undefined for performace?
// `origin` is the source site where this taint was first introduced (set in
// setTaint, carried forward on propagation). This is the lean provenance —
// "where did it come from" — not the full flow DAG; extend to a path later.
type TaintInfo = { bit: boolean; chars?: boolean[]; origin?: Site };

function infoTainted(info: TaintInfo | undefined): boolean {
  if (info === undefined) return false;
  if (info.bit) return true;
  return info.chars?.some((c) => c) ?? false;
}

// The origin of the first tainted parent that carries one — what a propagated
// value inherits as its own origin.
function inheritedOrigin(parents: Valued<TaintInfo>[]): Site | undefined {
  for (const p of parents) {
    if (infoTainted(p.info) && p.info?.origin !== undefined) return p.info.origin;
  }
  return undefined;
}

export class TaintAnalysis extends FlowAnalysis<TaintInfo> {

  static OPAQUE_CALLS = new Set<unknown>([console.log]);

  domain: InfoDomain<TaintInfo> = {
    getBottom: () => ({ bit: false }),
    isBottom: (info) => !info.bit && (info.chars === undefined || info.chars.every((c) => !c)),
  }

  policy: CallPolicy = {
    isOpaque: (f) => TaintAnalysis.OPAQUE_CALLS.has(f),
  }

  protected baseInfo(value: unknown, parents: Valued<TaintInfo>[]): TaintInfo {
    if (!parents.some((p) => infoTainted(p.info))) return { bit: false };
    const origin = inheritedOrigin(parents);
    if (typeof value === "string") {
      return { bit: true, chars: Array.from({ length: value.length }, () => true), origin };
    }
    return { bit: true, origin };
  }

  protected substringInfo(src: Valued<TaintInfo>, start: number, resultLength: number): TaintInfo {
    const chars: boolean[] = [];
    for (let i = 0; i < resultLength; i++) {
      if (src.info?.chars !== undefined) {
        chars.push(src.info.chars[start + i] === true);
      } else {
        chars.push(src.info?.bit ?? false);
      }
    }
    return { bit: chars.some((c) => c), chars, origin: inheritedOrigin([src]) };
  }

  protected concatenateInfo(left: Valued<TaintInfo>, leftLength: number, right: Valued<TaintInfo>, rightLength: number): TaintInfo {
    const chars: boolean[] = [];
    const push = (n: number, t: TaintInfo | undefined) => {
      for (let i = 0; i < n; i++) {
        chars.push(t?.chars !== undefined ? t.chars[i] === true : (t?.bit ?? false));
      }
    };
    push(leftLength, left.info);
    push(rightLength, right.info);
    return { bit: chars.some((c) => c), chars, origin: inheritedOrigin([left, right]) };
  }

  isTainted(value: unknown): boolean {
    return infoTainted(this.getInfo(value));
  }

  // Prelude entry point: `indexW` arrives still wrapped (the instrumented call
  // site hands ghost functions wrapped values). Project it to its concrete
  // index via the framework's `valued` — the prelude itself never touches
  // Wrapped/unwrap.
  isTaintedAt(value: unknown, indexW: unknown): boolean {
    const raw = this.valued(indexW).value;
    const index = typeof raw === "number" ? raw : Number(raw);
    const info = this.getInfo(value);
    if (info === undefined) return false;
    if (info.chars !== undefined && index >= 0 && index < info.chars.length) {
      return info.chars[index] === true;
    }
    return info.bit;
  }

  // Prelude entry point for `__assert__`: project the (wrapped) condition to its
  // concrete truth value and throw on falsy. Same convention as the taint
  // queries above — the prelude forwards a wrapped value, projection lives here.
  assert(condW: unknown): void {
    if (this.valued(condW).value) return;
    throw new Error("Assertion failed");
  }

  setTaint(value: unknown, tainted: boolean): void {
    const info = this.getOrCreateInfo(value, () => ({ bit: false }));
    if (info === undefined) return;
    info.bit = tainted;
    // The source site is where this taint is born; clearing taint clears it.
    info.origin = tainted ? this.site() : undefined;
    const concrete = this.valued(value).value;
    if (typeof concrete === "string") {
      info.chars = Array.from({ length: concrete.length }, () => tainted);
    }
  }

  // Where this value's taint originated (the source site recorded at setTaint,
  // carried forward through propagation), or undefined if untainted.
  taintOrigin(value: unknown): Site | undefined {
    const info = this.getInfo(value);
    return infoTainted(info) ? info.origin : undefined;
  }

  endExecution() {
    D$.analysis.result = { tainted: undefined };
  }
}

D$.analysis = new TaintAnalysis();
