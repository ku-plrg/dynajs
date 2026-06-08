// @manual

export function AO__ToNumber($: BootStrap, arg: Wrapped<unknown>): Wrapped<number> {
  const argument = $.peek(arg);
  return $.base(+argument, [arg]);
}
