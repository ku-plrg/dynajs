import type { SpecRuntime, Lifted, Unlifted, Primitive } from "../type.js";

export function AO__Construct($ : SpecRuntime, F : Lifted<unknown>, argumentsList ?: Lifted<unknown[]>, newTarget ?: Lifted<unknown>) {
  const Fu = $.peek(F);
  const argumentsListu = argumentsList ? $.peek(argumentsList) : [];
  const newTargetu = newTarget ? $.peek(newTarget) : Fu;
  const dependencies = [F, newTarget, ...(argumentsList ?? [])];
  // @ts-ignore coerce?
  return $.base(Reflect.construct(Fu, argumentsListu, newTargetu), dependencies);
}