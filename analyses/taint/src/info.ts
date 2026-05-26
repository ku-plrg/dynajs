import { Wrapper } from "@/model/wrap.js";

export type TaintInfo = { bit: boolean; chars?: boolean[] };

export class TaintInfoManager {
  taintMap = new Map<symbol, TaintInfo>();

  constructor(public wrapper: Wrapper<TaintInfo>) { }

  getOrCreateTaintInfo(id: symbol): TaintInfo {
    let t = this.taintMap.get(id);
    if (t === undefined) {
      t = { bit: false };
      this.taintMap.set(id, t);
    }
    return t;
  }

  isTainted(value: unknown): boolean {
    const e = this.wrapper.getEntry(value);
    if (e === undefined) return false;
    const t = this.taintMap.get(e.id);
    if (t === undefined) return false;
    if (t.bit) return true;
    if (t.chars !== undefined) {
      for (const c of t.chars) if (c) return true;
    }
    return false;
  }

  isTaintedAt(value: unknown, index: number): boolean {
    const e = this.wrapper.getEntry(value);
    if (e === undefined) return false;
    const t = this.taintMap.get(e.id);
    if (t === undefined) return false;
    if (t.chars !== undefined && index >= 0 && index < t.chars.length) {
      return t.chars[index] === true;
    }
    return t.bit;
  }

  setTaint(value: unknown, tainted: boolean): void {
    const e = this.wrapper.getEntry(value);
    if (e === undefined) return;
    const t = this.getOrCreateTaintInfo(e.id);
    t.bit = tainted;
    if (typeof e.value === "string") {
      t.chars = Array.from({ length: (e.value as string).length }, () => tainted);
    }
  }
}