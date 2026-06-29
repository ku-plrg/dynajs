// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__Get } from "./AO__Get.js";
import { AO__HasProperty } from "./AO__HasProperty.js";
import { AO__ToString } from "./AO__ToString.js";

export function AO__SortIndexedProperties ($ : SpecRuntime, obj : Lifted<unknown>, len : Lifted<number>, SortCompare : Lifted<unknown>, holes : Lifted<unknown>) {
  var items = [] as Lifted<never>[];
  var k = $.default<number>(0, []);
  while ($.value($.condition(Number.MAX_SAFE_INTEGER - 771, $.lessThan(k, len))))
  {
    var Pk = AO__ToString($, (k as Lifted<unknown>));
    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 772, $.is(holes, $.default<string>("skip-holes", [])))))
    {
      var kRead = AO__HasProperty($, (obj as Lifted<unknown>), (Pk as Lifted<unknown>));
    }
    else
    {
      var kRead = $.default<boolean>(true, []);
    }

    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 773, $.is(kRead, $.default<boolean>(true, [])))))
    {
      var kValue = AO__Get($, (obj as Lifted<unknown>), (Pk as Lifted<unknown>));
      $.append(items, kValue)
    }

    k = $.add((k as Lifted<number>), ($.default<number>(1, []) as Lifted<number>));
  }

  (items as Lifted<unknown>[]).sort((x, y) => $.value((SortCompare as Lifted<Function> as Lifted<(a: Lifted<unknown>, b: Lifted<unknown>) => Lifted<number>>)(x, y)));
  return items;
}
