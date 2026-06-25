// @manual EnumerableOwnProperties (ECMA-262 7.3.27)
// O.[[OwnPropertyKeys]], O.[[GetOwnProperty]] and desc.[[Enumerable]] are object
// essential-internal-methods that are not exposed on the lifted value domain,
// so — like AO__Get / AO__CreateDataProperty / AO__MakeBasicObject — this is
// modeled directly against the host object. For an ordinary object, the
// enumerable own STRING keys in [[OwnPropertyKeys]] order are exactly what
// `Object.keys` yields. Keys are structural property names, so they are reborn
// clean (`$.base(k, [])`); only the per-property VALUES (read through AO__Get)
// carry the holder's provenance.
import type { Lifted, SpecRuntime } from "../type.js";

import { AO__CreateArrayFromList } from "./AO__CreateArrayFromList.js";
import { AO__Get } from "./AO__Get.js";

export function AO__EnumerableOwnProperties ($ : SpecRuntime, O : Lifted<unknown>, kind : Lifted<unknown>) {
  // 1. Let ownKeys be ? O.[[OwnPropertyKeys]]().
  // 3.a (key is a String) + 3.a.ii (desc is enumerable) are folded into
  //     Object.keys, which returns only enumerable own string-keyed names.
  const ownKeys = Object.keys($.peek(O) as object);
  const kindRaw = String($.peek(kind));
  // 2. Let results be a new empty List.
  const results = [] as Lifted<unknown>[];
  // 3. For each element key of ownKeys, do
  for (const key of ownKeys) {
    const P = $.base(key, []) as Lifted<string>;
    if (kindRaw === "key") {
      // 3.a.ii.1. If kind is key, append key to results.
      $.append(results, P);
    } else {
      // 3.a.ii.2. Else, let value be ? Get(O, key).
      const value = AO__Get($, O, P as Lifted<unknown>);
      if (kindRaw === "value") {
        // 3.a.ii.2.b. If kind is value, append value to results.
        $.append(results, value);
      } else {
        // 3.a.ii.2.c. Else, append CreateArrayFromList(« key, value ») to results.
        const entry = AO__CreateArrayFromList($, [P, value] as Lifted<unknown>[]);
        $.append(results, entry);
      }
    }
  }
  // 4. Return results.
  return results;
}
