import type { Analysis } from "@/types/analysis.js";
import type { SpecOps } from "@/model/type.js";
import {
  installPrelude, taintMap, wrap, setTaint, __set_taint__,
  getEntry, __assert__, isWrapped, Entry, isTainted, unwrap,
} from "./prelude.js";

import { FlowAnalysis, BinFrame, UnFrame } from "@flow/index.js";

declare const D$: { analysis: Analysis } & Record<string, any>;

installPrelude();

class TaintAnalysis extends FlowAnalysis {
  static OPAQUE_CALLS = new Set<unknown>([console.log, __assert__]);

  spec: SpecOps = {
    base: (v: any, parents: any[]) => {
      const wrapped = wrap(v);
      if (parents.map(wrap).some(isTainted)) {
        setTaint(wrapped, true);
      }
      return wrapped;
    },
    peek: (maybeWrapped: any) => {
      // `wrap` is idiomatic
      const wrapped = wrap(maybeWrapped);
      return unwrap(wrapped);
    },
    str: null!, // temp
  };

  constructor() { super(); }

  isOpaqueFunction(f: unknown) {
    return TaintAnalysis.OPAQUE_CALLS.has(f);
  }

  endExecution() {
    D$.analysis.result = { tainted: undefined };
  }
}

D$.analysis = new TaintAnalysis();
