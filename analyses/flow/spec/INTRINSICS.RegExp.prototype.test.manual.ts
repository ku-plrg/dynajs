// @manual
// RegExp.prototype.test — the returned boolean IS the match predicate
// (str.in_re), so it is `$.regexExec(...).matched` directly. No branch here;
// the caller's own `if (re.test(s))` records the path condition.
import type { Lifted, SpecRuntime } from "../type.js";

import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_RegExp_prototype_test($: SpecRuntime, $this: Lifted<unknown>, S: Lifted<unknown> = $.undef) {
  var string = AO__ToString($, (S as Lifted<unknown>));
  return $.regexExec($this, (string as Lifted<string>)).matched;
}
