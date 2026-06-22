import type { SpecRuntime, Wrapped, Unwrapped, Primitive } from "../type.js";

export function AO__Construct($ : SpecRuntime, F : Wrapped<unknown>, argumentsList ?: Wrapped<unknown[]>, newTarget ?: Wrapped<unknown>) {
  const Fu = $.peek(F);
  const argumentsListu = argumentsList ? $.peek(argumentsList) : [];
  const newTargetu = newTarget ? $.peek(newTarget) : Fu;
  const dependencies = [F, newTarget, ...(argumentsList ?? [])];
  // @ts-ignore coerce?
  return $.base(Reflect.construct(Fu, argumentsListu, newTargetu), dependencies);
}