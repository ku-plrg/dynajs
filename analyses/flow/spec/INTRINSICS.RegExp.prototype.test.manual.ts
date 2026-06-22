// @manual
// RegExp.prototype.test — the returned boolean IS the match predicate
// (str.in_re), so it is `$.regexExec(...).matched` directly. No branch here;
// the caller's own `if (re.test(s))` records the path condition.
import type { Wrapped, SpecRuntime } from "../type.js";

import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_RegExp_prototype_test($: SpecRuntime, $this: Wrapped<unknown>, S: Wrapped<unknown> = $.undef) {
  var string = AO__ToString($, (S as Wrapped<unknown>));
  return $.regexExec($this, (string as Wrapped<string>)).matched;
}
