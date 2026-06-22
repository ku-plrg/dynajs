// @manual MakeBasicObject (ECMA-262 10.1.12)
// The spec describes this in prose ("a newly created object with an internal
// slot for each name", "essential internal methods set to the default ordinary
// object definitions") — there are no compilable steps, so it is modeled
// directly: a plain JS object whose internal slots are own properties and whose
// essential internal methods are the host object's own. Callers (e.g.
// OrdinaryObjectCreate) then assign slots like O["Prototype"] = proto.
import type { SpecRuntime, Wrapped, Unwrapped, Primitive } from "../type.js";

export function AO__MakeBasicObject(
  $: SpecRuntime,
  internalSlotsList: Wrapped<string>[],
): Record<string, unknown> {
  // 1. Set internalSlotsList to the list-concatenation of internalSlotsList and « [[PrivateElements]] ».
  internalSlotsList = internalSlotsList.concat(["PrivateElements"] as Wrapped<string>[]);
  // 2. Let obj be a newly created object with an internal slot for each name in internalSlotsList.
  // 3. NOTE: the initial value of each such internal slot is undefined unless specified otherwise.
  const obj: Record<string, unknown> = {};
  for (var i = 0; i < internalSlotsList.length; i++) {
    obj[internalSlotsList[i]] = undefined;
  }
  // 4. Set obj.[[PrivateElements]] to a new empty List.
  obj["PrivateElements"] = [];
  // 5. Set obj's essential internal methods to the default ordinary object
  //    definitions. (Modeled by the host JS object's own methods.)
  // 6-7. Asserts about [[Prototype]] / [[Extensible]] presence are the caller's
  //      responsibility — no-ops here.
  // 8. If internalSlotsList contains [[Extensible]], set obj.[[Extensible]] to true.
  if ($.contains(internalSlotsList, "Extensible" as Wrapped<string>)) {
    obj["Extensible"] = $.base<boolean>(true, []);
  }
  // 9. Return obj.
  return obj;
}
