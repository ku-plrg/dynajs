import { AO__Get } from "./AO__Get.js";

export function AO__ArraySpeciesCreate ($ : SpecRuntime, originalArray : Wrapped<unknown[]>, length : Wrapped<number>) {
  const isArray = Array.isArray($.peek(originalArray));
  if (!isArray) {
    throw new Error("TODO");
  }
  let C = AO__Get($, originalArray, $.base("constructor", []));
  
}
