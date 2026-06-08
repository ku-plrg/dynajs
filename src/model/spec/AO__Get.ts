
// @manual

export function AO__Get ($ : BootStrap, O : Wrapped<unknown>, P : Wrapped<unknown>) {
  // 1. Return ? O.[[Get]](P, O).
  // @ts-ignore $.peek(P) can be used as key. --- IGNORE ---
  return $.base($.peek(O)[$.peek(P)], [O, P]);
}
