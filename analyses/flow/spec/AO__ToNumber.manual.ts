import type { SpecRuntime, Lifted, Unlifted, Primitive } from "../type.js";

import { AO__ToPrimitive } from "./AO__ToPrimitive.js";

export function AO__ToNumber($: SpecRuntime, arg: Lifted<unknown>): Lifted<number> {
  let argument = $.value(arg);
  // ToNumber(Object) = ToNumber(? ToPrimitive(argument, number)). Coerce via the
  // model so a user valueOf/toString runs lifted; a native +object would
  // re-enter it and reject the lifted-primitive return ("Cannot convert object
  // to primitive value"). Then fall through to the primitive path below.
  if (argument !== null && (typeof argument === 'object' || typeof argument === 'function')) {
    arg = AO__ToPrimitive($, arg, $.default('number', []));
    argument = $.value(arg);
  }
  if (typeof argument === 'number') {
    return arg as Lifted<number>;
  }
  return $.default(+argument, [arg]);
}
