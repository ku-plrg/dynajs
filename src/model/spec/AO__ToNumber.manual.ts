export function AO__ToNumber($: SpecRuntime, arg: Wrapped<unknown>): Wrapped<number> {
  const argument = $.peek(arg);
  if (typeof argument === 'number') {
    return arg as Wrapped<number>;
  }
  return $.base(+argument, [arg]);
}
