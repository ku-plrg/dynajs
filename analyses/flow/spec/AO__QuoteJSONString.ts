// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

import { AO__UTF16EncodeCodePoint } from "./AO__UTF16EncodeCodePoint.js";
import { AO__UnicodeEscape } from "./AO__UnicodeEscape.js";

export function AO__QuoteJSONString ($ : SpecRuntime, value : Lifted<string>) {
  var product = $.default<string>("\"", []);
  product = $.concatenate(product, $.default<string>(JSON.stringify($.value(value)).slice(1, -1), [value]));
  product = $.concatenate(product, $.default<string>("\"", []));
  return product;
}
