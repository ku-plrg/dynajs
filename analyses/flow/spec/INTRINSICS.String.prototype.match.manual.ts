// @manual
// String.prototype.match — for a non-global RegExp the result is exactly an
// exec result (assembled from the symbolic match projection). A global match
// (all matches, no captures) or a string pattern (RegExp coercion) is not yet
// modeled symbolically; fall back to the native result so the concrete value
// stays correct.
import type { Lifted, SpecRuntime } from "../type.js";

import { AO__ArrayCreate } from "./AO__ArrayCreate.js";
import { AO__CreateDataPropertyOrThrow } from "./AO__CreateDataPropertyOrThrow.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_String_prototype_match($: SpecRuntime, $this: Lifted<unknown>, regexp: Lifted<unknown> = $.default(undefined, [])) {
  var string = AO__ToString($, ($this as Lifted<unknown>));
  var re: unknown = $.value(regexp);
  if (re instanceof RegExp && !re.global) {
    var m = $.regexExec((regexp as Lifted<unknown>), (string as Lifted<string>));
    if (!$.condition(Number.MAX_SAFE_INTEGER - 902, m.matched)) {
      return $.default<null>(null, []);
    }
    var A = AO__ArrayCreate($, ($.default<number>(m.captures.length, []) as Lifted<number>));
    for (var i = 0; i < m.captures.length; i++) {
      AO__CreateDataPropertyOrThrow($, (A as Lifted<unknown>), ($.default<string>(String(i), []) as Lifted<unknown>), (m.captures[i] as Lifted<unknown>));
    }
    AO__CreateDataPropertyOrThrow($, (A as Lifted<unknown>), ($.default<string>("index", []) as Lifted<unknown>), (m.index as Lifted<unknown>));
    AO__CreateDataPropertyOrThrow($, (A as Lifted<unknown>), ($.default<string>("input", []) as Lifted<unknown>), (m.input as Lifted<unknown>));
    return A;
  }
  // Global all-matches iteration and string-pattern coercion aren't modeled
  // symbolically yet — return the native result so the concrete value is right
  // (untracked array at this boundary; no symbolic provenance).
  return ($.value(string) as string).match(re as RegExp | string) as unknown as Lifted<unknown>;
}
