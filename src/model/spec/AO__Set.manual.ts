export function AO__Set ($ : SpecRuntime, O : Wrapped<unknown>, P : Wrapped<unknown>, V : Wrapped<unknown>, Throw : Wrapped<boolean>) {
  "use strict";

  const Ou = $.peek(O);
  const Pu = $.peek(P);
  const Vu = $.peek(V);

  // 1. Let success be ? O.[[Set]](P, V, O).
  try {
    // @ts-ignore coerce as property key
    Ou[Pu] = Vu;
  } catch (error) {
    // 2. If success is false and Throw is true, throw a TypeError exception.
    if (Throw) throw error;
  }
  // 3. Return unused.
}
