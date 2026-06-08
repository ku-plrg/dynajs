// @manual

export function AO__StringToNumber($: BootStrap, V: Wrapped<unknown>): Wrapped<number> {
  return $.base(Number($.peek(V)), [V]);
}
