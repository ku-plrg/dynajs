// @manual

export function AO__GetV($: BootStrap, V: Wrapped<unknown>, P: Wrapped<unknown>): Wrapped<unknown> {
  // @ts-ignore $.peek(P) can be used as key.
  return $.base($.peek(V)[$.peek(P)], [V, P]);
  // TODO check if this transformation is correct? 
}
