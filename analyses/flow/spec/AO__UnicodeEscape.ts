// @ts-nocheck
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

import { AO__StringPad } from "./AO__StringPad.js";

export function AO__UnicodeEscape ($ : SpecRuntime, C : Lifted<unknown>) {
  var n = C;
  throw new Error("YET: Let _hex_ be the String representation of _n_, formatted as a lowercase hexadecimal number.")
  return $.concatenate($.concatenate($.lit<string>("\\"), $.lit<string>("u")), AO__StringPad($, (hex as Lifted<string>), ($.lit<number>(4) as Lifted<number>), ($.lit<string>("0") as Lifted<string>), ($.lit<string>("start") as Lifted<unknown>)));
}
