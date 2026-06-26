// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

export function AO__ToBoolean ($ : SpecRuntime, argument : Lifted<unknown>) {
  if (($.value($.condition(Number.MAX_SAFE_INTEGER - 736, $.isType(argument, "boolean")))))
  {
    return argument;
  }

  if ((((((($.value($.condition(Number.MAX_SAFE_INTEGER - 737, $.is(argument, $.default<undefined>(undefined, [])))) || $.value($.condition(Number.MAX_SAFE_INTEGER - 738, $.is(argument, $.default<null>(null, []))))) || $.value($.condition(Number.MAX_SAFE_INTEGER - 739, $.is(argument, $.default<number>(0, []))))) || $.value($.condition(Number.MAX_SAFE_INTEGER - 740, $.is(argument, $.default<number>(0, []))))) || $.value($.condition(Number.MAX_SAFE_INTEGER - 741, $.isNaN(argument as Lifted<number>)))) || $.value($.condition(Number.MAX_SAFE_INTEGER - 742, $.is(argument, $.default<bigint>(0n, []))))) || $.value($.condition(Number.MAX_SAFE_INTEGER - 743, $.is(argument, $.default<string>("", []))))))
  {
    return $.default<boolean>(false, []);
  }

  return $.default<boolean>(true, []);
}
