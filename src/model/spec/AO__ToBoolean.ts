// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

export function AO__ToBoolean ($ : SpecRuntime, argument : Wrapped<unknown>) {
  if (($.isType(argument, "boolean")))
  {
    return argument;
  }

  if ((((((($.condition(Number.MAX_SAFE_INTEGER - 629, $.is(argument, $.base<undefined>(undefined, []))) || $.condition(Number.MAX_SAFE_INTEGER - 630, $.is(argument, $.base<null>(null, [])))) || $.condition(Number.MAX_SAFE_INTEGER - 631, $.is(argument, $.base<number>(0, [])))) || $.condition(Number.MAX_SAFE_INTEGER - 632, $.is(argument, $.base<number>(0, [])))) || $.isNaN(argument as Wrapped<number>)) || $.condition(Number.MAX_SAFE_INTEGER - 633, $.is(argument, $.base<bigint>(0n, [])))) || $.condition(Number.MAX_SAFE_INTEGER - 634, $.is(argument, $.base<string>("", [])))))
  {
    return $.base<boolean>(false, []);
  }

  return $.base<boolean>(true, []);
}
