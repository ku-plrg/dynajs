export function AO__CreateArrayIterator ($ : SpecRuntime, array : Wrapped<unknown[]>, kind : Wrapped<string>) {
  // error: typed array not supported
  const unwrappedArray = $.peek(array);
  const kindUnwrapped = $.peek(kind);
  switch (kindUnwrapped) {
    case "key":
      return unwrappedArray.keys();
    case "value":
      return unwrappedArray.values();
    case "key+value":
      return unwrappedArray.entries();
    default:
      throw new TypeError("Invalid kind for array iterator");
  }
}