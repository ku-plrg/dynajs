import type { Analysis } from "@/types/analysis.js";
import type { SpecOps, Wrapped, Unwrapped, Primitive } from "@/model/type.js";
import { FlowAnalysis } from "@/model/flow.js";
import { TaintInfoManager, TaintInfo } from "./info.js";
import { installPrelude } from "./prelude.js";

declare const D$: { analysis: Analysis } & Record<string, any>;

installPrelude();

export class TaintAnalysis extends FlowAnalysis<TaintInfo> {

  static OPAQUE_CALLS = new Set<unknown>([console.log]);

  taint: TaintInfoManager
  constructor() { 
    super();
    this.taint = new TaintInfoManager(this.wrapper);
  }

  spec: SpecOps = {
    base: <T extends Unwrapped<unknown> | Primitive>(v: T, parents: Wrapped<unknown>[]): Wrapped<T> => {
      const wrapped = this.wrapper.wrap(v);
      // capture `this`
      if (parents.map((p) => this.wrapper.wrap(p)).some((p) => this.taint.isTainted(p))) {
        this.taint.setTaint(wrapped, true);
      }
      return wrapped;
    },
    peek: <T>(wrapped: Wrapped<T>) => this.wrapper.unwrap(wrapped),
    substring: (s: Wrapped<string>, start: Wrapped<number>, end: Wrapped<number>): Wrapped<string> => {
        const e = this.wrapper.getEntry(s);
        const raw = e !== undefined ? (e.value as string) : (s as string);
        const r = raw.substring(start, end);
        const w = this.wrapper.wrap(r);
        const we = this.wrapper.getEntry(w);
        if (we === undefined) return w;
        const srcInfo = e !== undefined ? this.taint.taintMap.get(e.id) : undefined;
        const chars: boolean[] = [];
        for (let i = 0; i < r.length; i++) {
          if (srcInfo?.chars !== undefined) {
            chars.push(srcInfo.chars[start + i] === true);
          } else {
            chars.push(srcInfo?.bit ?? false);
          }
        }
        const info = this.taint.getOrCreateTaintInfo(we.id);
        info.chars = chars;
        if (chars.some((c) => c)) info.bit = true;
        return w;
      },
      concatenate: (s1: Wrapped<string>, s2: Wrapped<string>): Wrapped<string> => {
        const e1 = this.wrapper.getEntry(s1);
        const e2 = this.wrapper.getEntry(s2);
        const r1 = e1 !== undefined ? (e1.value as string) : (s1 as string);
        const r2 = e2 !== undefined ? (e2.value as string) : (s2 as string);
        const r = r1 + r2;
        const w = this.wrapper.wrap(r);
        const we = this.wrapper.getEntry(w);
        if (we === undefined) return w;
        const t1 = e1 !== undefined ? this.taint.taintMap.get(e1.id) : undefined;
        const t2 = e2 !== undefined ? this.taint.taintMap.get(e2.id) : undefined;
        const chars: boolean[] = [];
        const push = (n: number, t: { bit: boolean; chars?: boolean[] } | undefined) => {
          for (let i = 0; i < n; i++) {
            chars.push(t?.chars !== undefined ? t.chars[i] === true : (t?.bit ?? false));
          }
        };
        push(r1.length, t1);
        push(r2.length, t2);
        const info = this.taint.getOrCreateTaintInfo(we.id);
        info.chars = chars;
        if (chars.some((c) => c)) info.bit = true;
        return w;
      },
  };

  isOpaqueFunction(f: unknown) {
    return TaintAnalysis.OPAQUE_CALLS.has(f);
  }

  endExecution() {
    D$.analysis.result = { tainted: undefined };
  }
}

D$.analysis = new TaintAnalysis();
