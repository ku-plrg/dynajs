export function AO__CreateDataProperty ($ : SpecRuntime, O : Wrapped<unknown>, P : Wrapped<unknown>, V : Wrapped<unknown>) {
  var newDesc = {"value": V, "writable": true, "enumerable": true, "configurable": true };
  // @ts-ignore $.peek(P) can be used as key. --- IGNORE ---
  return $.base(Object.defineProperty($.peek(O), $.peek(P), newDesc) !== undefined, [O, P, V]);
}
