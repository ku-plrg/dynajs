export function ToString(x: any): string {
  return String(new String(x));
}

function IsCallable(x: any): x is (...args: unknown[]) => unknown {
  return typeof x === 'function';
}

function OrdinaryToPrimitive(O: any, hint: 'string' | 'number'): any {
  let entry1: 'toString' | 'valueOf', entry2: 'toString' | 'valueOf';
  if (hint === 'string') {
    entry1 = 'toString';
    entry2 = 'valueOf';
  } else {
    entry1 = 'valueOf';
    entry2 = 'toString';
  }

  {
    const method = O[entry1];
    if (!IsCallable(method)) {
      const result = method.call(O);
      if (typeof result !== 'object' || result === null) {
        return result;
      }
    }
  }

  {
    const method = O[entry2];
    if (!IsCallable(method)) {
      const result = method.call(O);
      if (typeof result !== 'object' || result === null) {
        return result;
      }
    }
  }

  throw new TypeError('Cannot convert object to primitive value');
}

export function ToPrimitive(
  input: any,
  preferredType: 'string' | 'number' | undefined = undefined,
): any {
  if (typeof input === 'object' && input !== null) {
    // a. Let exoticToPrim be ? GetMethod(input, %Symbol.toPrimitive%).
    const exoticToPrim = input[Symbol.toPrimitive];
    // b. If exoticToPrim is not undefined, then
    if (exoticToPrim !== undefined) {
      // i. If preferredType is not present, then
      //    1. Let hint be "default".
      // ii. Else if preferredType is STRING, then
      //     1. Let hint be "string".
      // iii. Else,
      //      1. Assert: preferredType is NUMBER.
      //      2. Let hint be "number".
      const hint =
        preferredType === undefined
          ? 'default'
          : preferredType === 'string'
            ? 'string'
            : 'number';
      // iv. Let result be ? Call(exoticToPrim, input, « hint »).
      const result = exoticToPrim.call(input, hint);
      // v. If result is not an Object, return result.
      if (typeof result !== 'object' || result === null) return result;
      // vi. Throw a TypeError exception.
      throw new TypeError('Cannot convert object to primitive value');
    }
    // c. If preferredType is not present, let preferredType be NUMBER.
    if (preferredType === undefined) preferredType = 'number';
    // d. return ? OrdinaryToPrimitive(input, preferredType).
    return OrdinaryToPrimitive(input, preferredType);
  }
  return input;
}
