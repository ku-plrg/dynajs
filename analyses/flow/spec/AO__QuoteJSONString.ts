// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

import { AO__UTF16EncodeCodePoint } from "./AO__UTF16EncodeCodePoint.js";
import { AO__UnicodeEscape } from "./AO__UnicodeEscape.js";

export function AO__QuoteJSONString ($ : SpecRuntime, value : Lifted<string>) {
  var product = $.lit<string>("\"");
  product = $.concatenate(product, $.base<string>(JSON.stringify($.peek(value)).slice(1, -1), [value]));
  product = $.concatenate(product, $.lit<string>("\""));
  return product;
}
