
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, BootStrap } from "@/model/type.js";

import { AO__RegExpAlloc } from "./AO__RegExpAlloc.js";
import { AO__RegExpInitialize } from "./AO__RegExpInitialize.js";

export function AO__RegExpCreate ($ : BootStrap, P : Wrapped<unknown>, F : Wrapped<string | undefined>) {
  var obj = AO__RegExpAlloc($, (RegExp as Wrapped<unknown>));
  return AO__RegExpInitialize($, (obj as Wrapped<unknown>), (P as Wrapped<unknown>), (F as Wrapped<unknown>));
}
