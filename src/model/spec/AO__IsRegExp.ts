
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

import { AO__Get } from "./AO__Get.js";
import { AO__ToBoolean } from "./AO__ToBoolean.js";

export function AO__IsRegExp ($ : SpecRuntime, argument : Wrapped<unknown>) {
  if (!($.isType(argument, "object")))
  {
    return $.base<boolean>(false, []);
  }

  var matcher = AO__Get($, (argument as Wrapped<unknown>), ($.base<symbol>(Symbol.match, []) as Wrapped<unknown>));
  if (!$.is(matcher, $.base<undefined>(undefined, [])))
  {
    return AO__ToBoolean($, (matcher as Wrapped<unknown>));
  }

  if (("RegExpMatcher" in argument))
  {
    return $.base<boolean>(true, []);
  }

  return $.base<boolean>(false, []);
}
