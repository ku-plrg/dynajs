
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, BootStrap } from "@/model/type.js";

import { AO__Call } from "./AO__Call.js";
import { AO__GetMethod } from "./AO__GetMethod.js";
import { AO__Invoke } from "./AO__Invoke.js";
import { AO__RegExpCreate } from "./AO__RegExpCreate.js";
import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_String_prototype_match ($ : BootStrap, $this : Wrapped<unknown>, regexp : Wrapped<unknown>) {
  var O = AO__RequireObjectCoercible($, $this);
  if (!($.is(regexp, $.base<undefined>(undefined, [])) || $.is(regexp, $.base<null>(null, []))))
  {
    var matcher = AO__GetMethod($, (regexp as Wrapped<unknown>), ($.base<symbol>(Symbol.match, []) as Wrapped<unknown>));
    if (!$.is(matcher, $.base<undefined>(undefined, [])))
    {
      return AO__Call($, (matcher as Wrapped<unknown>), (regexp as Wrapped<unknown>), ([O] as Wrapped<unknown>[]));
    }

  }

  var S = AO__ToString($, (O as Wrapped<unknown>));
  var rx = AO__RegExpCreate($, (regexp as Wrapped<unknown>), ($.base<undefined>(undefined, []) as Wrapped<string | undefined>));
  return AO__Invoke($, (rx as Wrapped<unknown>), ($.base<symbol>(Symbol.match, []) as Wrapped<unknown>), ([S] as Wrapped<unknown>[]));
}
