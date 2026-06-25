import type { SpecRuntime, Lifted, Unlifted, Primitive } from "../type.js";

export function AO__CreateArrayIterator ($ : SpecRuntime, array : Lifted<unknown>, kind : Lifted<string>) {
  // error: typed array not supported
  // TODO array only...
  const unliftedArray = $.value(array);
  const kindUnlifted = $.value(kind);
  switch (kindUnlifted) {
    case "key":
      // @ts-ignore nextline
      return unliftedArray.keys();
    case "value":
      // @ts-ignore nextline
      return unliftedArray.values();
    case "key+value":
      // @ts-ignore nextline
      return unliftedArray.entries();
    default:
      throw new TypeError("Invalid kind for array iterator");
  }
}