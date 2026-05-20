import type { Analysis } from "@/types/analysis.js";
import { installPrelude, taintState } from "./prelude.js";

declare const D$: { analysis: Analysis } & Record<string, any>;

installPrelude();

const analysis: Analysis = {
  read(_id, name, _value) {
    taintState.noteRead(name);
  },

  write(_id, names, _value) {
    taintState.noteWrite(names);
  },

  endExecution() {
    D$.analysis.result = { tainted: taintState.snapshot() };
  },
};

D$.analysis = analysis;
