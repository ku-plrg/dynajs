// @manual
// String.prototype.match — for a non-global RegExp the result is exactly an
// exec result (assembled from the symbolic match projection). A global match
// (all matches, no captures) or a string pattern (RegExp coercion) is not yet
// modeled symbolically; fall back to the native result so the concrete value
// stays correct.
import type { Wrapped, SpecRuntime } from "../type.js";

import { AO__ArrayCreate } from "./AO__ArrayCreate.js";
import { AO__CreateDataPropertyOrThrow } from "./AO__CreateDataPropertyOrThrow.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_String_prototype_match($: SpecRuntime, $this: Wrapped<unknown>, regexp: Wrapped<unknown> = $.undef) {
  var string = AO__ToString($, ($this as Wrapped<unknown>));
  var re: unknown = $.peek(regexp);
  if (re instanceof RegExp && !re.global) {
    var m = $.regexExec((regexp as Wrapped<unknown>), (string as Wrapped<string>));
    if (!$.condition(Number.MAX_SAFE_INTEGER - 902, m.matched)) {
      return $.base<null>(null, []);
    }
    var A = AO__ArrayCreate($, ($.base<number>(m.captures.length, []) as Wrapped<number>));
    for (var i = 0; i < m.captures.length; i++) {
      AO__CreateDataPropertyOrThrow($, (A as Wrapped<unknown>), ($.base<string>(String(i), []) as Wrapped<unknown>), (m.captures[i] as Wrapped<unknown>));
    }
    AO__CreateDataPropertyOrThrow($, (A as Wrapped<unknown>), ($.base<string>("index", []) as Wrapped<unknown>), (m.index as Wrapped<unknown>));
    AO__CreateDataPropertyOrThrow($, (A as Wrapped<unknown>), ($.base<string>("input", []) as Wrapped<unknown>), (m.input as Wrapped<unknown>));
    return A;
  }
  // Global all-matches iteration and string-pattern coercion aren't modeled
  // symbolically yet — return the native result so the concrete value is right
  // (untracked array at this boundary; no symbolic provenance).
  return ($.peek(string) as string).match(re as RegExp | string) as unknown as Wrapped<unknown>;
}
