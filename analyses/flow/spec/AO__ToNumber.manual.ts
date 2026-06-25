import type { SpecRuntime, Lifted, Unwrapped, Primitive } from "../type.js";

export function AO__ToNumber($: SpecRuntime, arg: Lifted<unknown>): Lifted<number> {
  const argument = $.peek(arg);
  if (typeof argument === 'number') {
    return arg as Lifted<number>;
  }
  return $.base(+argument, [arg]);
}
