export function AO__ArrayCreate($ : SpecRuntime, length : Wrapped<number>, proto?: Wrapped<unknown>): Wrapped<unknown> {
  const len = $.peek(length);
  // 1. If length > 2**32 - 1, throw a RangeError exception.
  if (len > 2 ** 32 - 1) {
    throw new RangeError("AO__ArrayCreate : length is too large");
  }
  // 2. If proto is not present, set proto to %Array.prototype%.
  // short-path:
  if (proto === undefined) return $.base(new Array(len) as Unwrapped<Array<unknown>>, []);

  throw new Error("AO__ArrayCreate : non-default proto is not supported yet");
  // 3. Let A be MakeBasicObject(« [[Prototype]], [[Extensible]] »).
  // 4. Set A.[[Prototype]] to proto.
  // 5. Set A.[[DefineOwnProperty]] as specified in 10.4.2.1.
  // 6. Perform ! OrdinaryDefineOwnProperty(A, "length", PropertyDescriptor { [[Value]]: 𝔽(length), [[Writable]]: true, [[Enumerable]]: false, [[Configurable]]: false }).
  // 7. Return A.
}