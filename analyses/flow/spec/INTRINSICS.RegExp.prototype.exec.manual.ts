// @manual
// RegExp.prototype.exec — assemble the ECMAScript exec result from the symbolic
// match projection ($.regexExec). On a match, the result array holds the whole
// match at [0] and group i at [i] (each carrying its capture Sym), plus the
// `index`/`input` properties; on no match it is null. This is the tail of the
// spec's RegExpBuiltinExec, built from the one regex primitive.
import type { Lifted, SpecRuntime } from "../type.js";

import { AO__ArrayCreate } from "./AO__ArrayCreate.js";
import { AO__CreateDataPropertyOrThrow } from "./AO__CreateDataPropertyOrThrow.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_RegExp_prototype_exec($: SpecRuntime, $this: Lifted<unknown>, S: Lifted<unknown> = $.default(undefined, [])) {
  var string = AO__ToString($, (S as Lifted<unknown>));
  var m = $.regexExec($this, (string as Lifted<string>));
  if (!$.condition(Number.MAX_SAFE_INTEGER - 900, m.matched)) {
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
