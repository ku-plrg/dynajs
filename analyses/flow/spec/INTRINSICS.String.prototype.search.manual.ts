// @manual
// String.prototype.search — the index where `regexp` first matches the subject,
// else -1. Built from the symbolic match projection: branch on `matched`
// (records the path condition), returning the match start index or -1. ExpoSE
// uses a no-fork ite here as an optimization; a fork is equivalent for coverage.
import type { Lifted, SpecRuntime } from "../type.js";

import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_String_prototype_search($: SpecRuntime, $this: Lifted<unknown>, regexp: Lifted<unknown> = $.default(undefined, [])) {
  var string = AO__ToString($, ($this as Lifted<unknown>));
  var m = $.regexExec((regexp as Lifted<unknown>), (string as Lifted<string>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 901, m.matched)) {
    return m.index;
  }
  return $.default<number>(-1, []);
}
