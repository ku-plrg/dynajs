export function AO__StringToNumber($: SpecRuntime, V: Wrapped<unknown>): Wrapped<number> {
  return $.base(Number($.peek(V)), [V]);
}
