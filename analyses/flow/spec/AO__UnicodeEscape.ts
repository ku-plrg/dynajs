// @ts-nocheck
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "../type.js";

import { AO__StringPad } from "./AO__StringPad.js";

export function AO__UnicodeEscape ($ : SpecRuntime, C : Wrapped<unknown>) {
  var n = C;
  throw new Error("YET: Let _hex_ be the String representation of _n_, formatted as a lowercase hexadecimal number.")
  return $.concatenate($.concatenate($.lit<string>("\\"), $.lit<string>("u")), AO__StringPad($, (hex as Wrapped<string>), ($.lit<number>(4) as Wrapped<number>), ($.lit<string>("0") as Wrapped<string>), ($.lit<string>("start") as Wrapped<unknown>)));
}
