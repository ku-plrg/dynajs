import type { SpecRuntime, Wrapped, Unwrapped, Primitive } from "../type.js";

import { AO__Get } from "./AO__Get.js";
import { AO__IsConstructor } from "./AO__IsConstructor.js";
import { AO__ArrayCreate } from "./AO__ArrayCreate.js";

export function AO__ArraySpeciesCreate ($ : SpecRuntime, originalArray : Wrapped<unknown>, length : Wrapped<number>) {
  // 1. Let isArray be ? IsArray(originalArray).
  const isArray = Array.isArray($.peek(originalArray));
  // 2. If isArray is false, return ? ArrayCreate(length).
  if (!isArray) {
    return $.base(new Array($.peek(length)) as Unwrapped<unknown[]>, [length]);
  }
  // 3. Let C be ? Get(originalArray, "constructor").
  let C = AO__Get($, originalArray, $.base("constructor", []));
  if ($.peek(AO__IsConstructor($, C))) {
  // 4. If IsConstructor(C) is true, then
  //    a. Let thisRealm be the current Realm Record.
  //    b. Let realmC be ? GetFunctionRealm(C).
  //    c. If thisRealm and realmC are not the same Realm Record, then
  //       i. If SameValue(C, realmC.[[Intrinsics]].[[%Array%]]) is true, set C to undefined.
  }
  if ($.isType(C, "object")) {
  // 5. If C is an Object, then
  //    a. Set C to ? Get(C, %Symbol.species%).
    C = AO__Get($, C, $.base(Symbol.species, []));
  //    b. If C is null, set C to undefined.
    if ($.peek(C) === null) C = $.undef;
  }
  if ($.isType(C, "undefined")) {
  // 6. If C is undefined, return ? ArrayCreate(length).
    return AO__ArrayCreate($, length);
  }
  // 7. If IsConstructor(C) is false, throw a TypeError exception.
  // 8. Return ? Construct(C, « 𝔽(length) »).
  // The default species is %Array%; model Construct(C, «length») as
  // ArrayCreate(length). User-defined @@species subclasses are not modeled.
  return AO__ArrayCreate($, length);
}
