// @ts-nocheck
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { markConstructable } from "../internal/constructable.js";
import { AO__GetPrototypeFromConstructor } from "./AO__GetPrototypeFromConstructor.js";
import { AO__StringCreate } from "./AO__StringCreate.js";
import { AO__SymbolDescriptiveString } from "./AO__SymbolDescriptiveString.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_String ($ : SpecRuntime, $this : Lifted<unknown>, value : Lifted<unknown>) {
  var valueIsPresent = arguments.length > 2;
  if (!valueIsPresent)
  {
    var s = $.default<string>("", []);
  }
  else
  {
    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 422, $.is($.default<Unlifted<unknown>>(new.target as unknown as Unlifted<unknown>, []), $.default<undefined>(undefined, [])))) && ($.value($.condition(Number.MAX_SAFE_INTEGER - 423, $.isType(value, "symbol")))))
    {
      return AO__SymbolDescriptiveString($, (value as Lifted<unknown>));
    }

    var s = AO__ToString($, (value as Lifted<unknown>));
  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 424, $.is($.default<Unlifted<unknown>>(new.target as unknown as Unlifted<unknown>, []), $.default<undefined>(undefined, [])))))
  {
    return s;
  }

  return AO__StringCreate($, (s as Lifted<string>), (AO__GetPrototypeFromConstructor($, ($.default<Unlifted<unknown>>(new.target as unknown as Unlifted<unknown>, []) as Lifted<unknown>), ($.default<string>("%String.prototype%", []) as Lifted<string>)) as Lifted<unknown>));
}

markConstructable(INTRINSICS_String);
