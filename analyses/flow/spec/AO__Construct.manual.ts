import type { SpecRuntime, Lifted, Unlifted, Primitive } from "../type.js";

export function AO__Construct($ : SpecRuntime, F : Lifted<unknown>, argumentsList ?: Lifted<unknown[]>, newTarget ?: Lifted<unknown>) {
  return $.construct(F, (argumentsList ?? []) as Lifted<unknown>[], newTarget);
}
