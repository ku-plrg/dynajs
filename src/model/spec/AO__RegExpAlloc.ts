
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, BootStrap } from "@/model/type.js";

import { AO__DefinePropertyOrThrow } from "./AO__DefinePropertyOrThrow.js";
import { AO__OrdinaryCreateFromConstructor } from "./AO__OrdinaryCreateFromConstructor.js";

export function AO__RegExpAlloc ($ : BootStrap, newTarget : Wrapped<unknown>) {
  var obj = AO__OrdinaryCreateFromConstructor($, (newTarget as Wrapped<unknown>), ($.base<string>("%RegExp.prototype%", []) as Wrapped<string>), (["OriginalSource", "OriginalFlags", "RegExpRecord", "RegExpMatcher"] as Wrapped<unknown>));
  AO__DefinePropertyOrThrow($, (obj as Wrapped<unknown>), ($.base<string>("lastIndex", []) as Wrapped<unknown>), ({"Writable": $.base<boolean>(true, []), "Enumerable": $.base<boolean>(false, []), "Configurable": $.base<boolean>(false, [])} as Wrapped<unknown>));
  return obj;
}
