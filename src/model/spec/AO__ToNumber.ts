// @manual

export function AO__ToNumber($: BootStrap, arg: Wrapped<unknown>): Wrapped<number> {
  const argument = $.peek(arg);
  if (typeof argument === 'number') {
    return arg as Wrapped<number>;
  }
  return $.base(+argument, [arg]);
}
