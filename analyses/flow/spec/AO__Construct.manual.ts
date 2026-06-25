import type { SpecRuntime, Lifted, Unlifted, Primitive } from "../type.js";

export function AO__Construct($ : SpecRuntime, F : Lifted<unknown>, argumentsList ?: Lifted<unknown[]>, newTarget ?: Lifted<unknown>) {
  const Fu = $.value(F);
  const argumentsListu = argumentsList ? $.value(argumentsList) : [];
  const newTargetu = newTarget ? $.value(newTarget) : Fu;
  const dependencies = [F, newTarget, ...(argumentsList ?? [])];
  // @ts-ignore coerce?
  return $.default(Reflect.construct(Fu, argumentsListu, newTargetu), dependencies);
}