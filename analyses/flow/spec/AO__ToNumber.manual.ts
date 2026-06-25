import type { SpecRuntime, Lifted, Unlifted, Primitive } from "../type.js";

export function AO__ToNumber($: SpecRuntime, arg: Lifted<unknown>): Lifted<number> {
  const argument = $.value(arg);
  if (typeof argument === 'number') {
    return arg as Lifted<number>;
  }
  return $.default(+argument, [arg]);
}
