export function AO__Get ($ : SpecRuntime, O : Wrapped<unknown>, P : Wrapped<unknown>): Wrapped<unknown> {
  // 1. Return ? O.[[Get]](P, O).
  // @ts-ignore $.peek(P) can be used as key. --- IGNORE ---
  return $.base($.peek(O)[$.peek(P)], [O, P]);
}
