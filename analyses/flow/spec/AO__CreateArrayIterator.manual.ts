export function AO__CreateArrayIterator ($ : SpecRuntime, array : Wrapped<unknown>, kind : Wrapped<string>) {
  // error: typed array not supported
  // TODO array only...
  const unwrappedArray = $.peek(array);
  const kindUnwrapped = $.peek(kind);
  switch (kindUnwrapped) {
    case "key":
      // @ts-ignore nextline
      return unwrappedArray.keys();
    case "value":
      // @ts-ignore nextline
      return unwrappedArray.values();
    case "key+value":
      // @ts-ignore nextline
      return unwrappedArray.entries();
    default:
      throw new TypeError("Invalid kind for array iterator");
  }
}