
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

import { AO__Get } from "./AO__Get.js";
import { AO__HasProperty } from "./AO__HasProperty.js";
import { AO__ToString } from "./AO__ToString.js";

export function AO__SortIndexedProperties ($ : SpecRuntime, obj : Wrapped<unknown>, len : Wrapped<number>, SortCompare : Wrapped<unknown>, holes : Wrapped<unknown>) {
  var items = [] as Wrapped<never>[];
  var k = $.base<number>(0, []);
  while ($.condition(Number.MAX_SAFE_INTEGER - 554, $.lessThan(k, len)))
  {
    var Pk = AO__ToString($, (k as Wrapped<unknown>));
    if ($.condition(Number.MAX_SAFE_INTEGER - 555, $.is(holes, $.base<string>("skip-holes", []))))
    {
      var kRead = AO__HasProperty($, (obj as Wrapped<unknown>), (Pk as Wrapped<unknown>));
    }
    else
    {
      var kRead = $.base<boolean>(true, []);
    }

    if ($.condition(Number.MAX_SAFE_INTEGER - 556, $.is(kRead, $.base<boolean>(true, []))))
    {
      var kValue = AO__Get($, (obj as Wrapped<unknown>), (Pk as Wrapped<unknown>));
      $.append(items, kValue)
    }

    k = $.add((k as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>));
  }

  throw new Error("YET: Sort _items_ using an implementation-defined sequence of <emu-meta effects=\"user-code\">calls to _SortCompare_</emu-meta>. If any such call returns an abrupt completion, stop before performing any further calls to _SortCompare_ and return that Completion Record.")
  return items;
}
