import type { Analysis } from "@/types/analysis.js";
import { FlowAnalysis, type Valued } from "@/model/flow.js";
import { installPrelude } from "./prelude.js";

declare const D$: { analysis: Analysis } & Record<string, any>;

installPrelude();

type TaintInfo = { bit: boolean; chars?: boolean[] };

function infoTainted(info: TaintInfo | undefined): boolean {
  if (info === undefined) return false;
  if (info.bit) return true;
  return info.chars?.some((c) => c) ?? false;
}

export class TaintAnalysis extends FlowAnalysis<TaintInfo> {

  static OPAQUE_CALLS = new Set<unknown>([console.log]);

  isOpaqueFunction(f: unknown) {
    return TaintAnalysis.OPAQUE_CALLS.has(f);
  }

  protected baseInfo(value: unknown, parents: Valued<TaintInfo>[]): TaintInfo | undefined {
    if (!parents.some((p) => infoTainted(p.info))) return undefined;
    if (typeof value === "string") {
      return { bit: true, chars: Array.from({ length: value.length }, () => true) };
    }
    return { bit: true };
  }

  protected substringInfo(src: Valued<TaintInfo>, start: number, resultLength: number): TaintInfo | undefined {
    const chars: boolean[] = [];
    for (let i = 0; i < resultLength; i++) {
      if (src.info?.chars !== undefined) {
        chars.push(src.info.chars[start + i] === true);
      } else {
        chars.push(src.info?.bit ?? false);
      }
    }
    return { bit: chars.some((c) => c), chars };
  }

  protected concatenateInfo(left: Valued<TaintInfo>, leftLength: number, right: Valued<TaintInfo>, rightLength: number): TaintInfo | undefined {
    const chars: boolean[] = [];
    const push = (n: number, t: TaintInfo | undefined) => {
      for (let i = 0; i < n; i++) {
        chars.push(t?.chars !== undefined ? t.chars[i] === true : (t?.bit ?? false));
      }
    };
    push(leftLength, left.info);
    push(rightLength, right.info);
    return { bit: chars.some((c) => c), chars };
  }

  isTainted(value: unknown): boolean {
    return infoTainted(this.getInfo(value));
  }

  isTaintedAt(value: unknown, index: number): boolean {
    const info = this.getInfo(value);
    if (info === undefined) return false;
    if (info.chars !== undefined && index >= 0 && index < info.chars.length) {
      return info.chars[index] === true;
    }
    return info.bit;
  }

  setTaint(value: unknown, tainted: boolean): void {
    const info = this.getOrCreateInfo(value, () => ({ bit: false }));
    if (info === undefined) return;
    info.bit = tainted;
    const concrete = this.valued(value).value;
    if (typeof concrete === "string") {
      info.chars = Array.from({ length: concrete.length }, () => tainted);
    }
  }

  endExecution() {
    D$.analysis.result = { tainted: undefined };
  }
}

D$.analysis = new TaintAnalysis();
