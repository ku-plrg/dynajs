// @ts-nocheck
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__ArrayCreate } from "./AO__ArrayCreate.js";
import { AO__Construct } from "./AO__Construct.js";
import { AO__CreateDataPropertyOrThrow } from "./AO__CreateDataPropertyOrThrow.js";
import { AO__IsConstructor } from "./AO__IsConstructor.js";
import { AO__Set } from "./AO__Set.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_Array_of ($ : SpecRuntime, $this : Lifted<unknown>, ...items : Lifted<unknown>[]) {
  var len = $.default<number>(items.length, []);
  var lenNumber = len;
  var C = $this;
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 114, $.is(AO__IsConstructor($, (C as Lifted<unknown>)), $.default<boolean>(true, [])))))
  {
    var A = AO__Construct($, (C as Lifted<unknown>), ([lenNumber] as Lifted<unknown>[]));
  }
  else
  {
    var A = AO__ArrayCreate($, (len as Lifted<number>));
  }

  var k = $.default<number>(0, []);
  while ($.value($.condition(Number.MAX_SAFE_INTEGER - 115, $.lessThan(k, len))))
  {
    var kValue = items[k];
    var Pk = AO__ToString($, (k as Lifted<unknown>));
    AO__CreateDataPropertyOrThrow($, (A as Lifted<unknown>), (Pk as Lifted<unknown>), (kValue as Lifted<unknown>));
    k = $.add((k as Lifted<number>), ($.default<number>(1, []) as Lifted<number>));
  }

  AO__Set($, (A as Lifted<unknown>), ($.default<string>("length", []) as Lifted<unknown>), (lenNumber as Lifted<unknown>), ($.default<boolean>(true, []) as Lifted<boolean>));
  return A;
}
