// @manual
// RegExp.prototype.exec — assemble the ECMAScript exec result from the symbolic
// match projection ($.regexExec). On a match, the result array holds the whole
// match at [0] and group i at [i] (each carrying its capture Sym), plus the
// `index`/`input` properties; on no match it is null. This is the tail of the
// spec's RegExpBuiltinExec, built from the one regex primitive.
import type { Wrapped, SpecRuntime } from "@/model/type.js";

import { AO__ArrayCreate } from "./AO__ArrayCreate.js";
import { AO__CreateDataPropertyOrThrow } from "./AO__CreateDataPropertyOrThrow.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_RegExp_prototype_exec($: SpecRuntime, $this: Wrapped<unknown>, S: Wrapped<unknown> = $.undef) {
  var string = AO__ToString($, (S as Wrapped<unknown>));
  var m = $.regexExec($this, (string as Wrapped<string>));
  if (!$.condition(Number.MAX_SAFE_INTEGER - 900, m.matched)) {
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
