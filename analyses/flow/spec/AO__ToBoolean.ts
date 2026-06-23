// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "../type.js";

export function AO__ToBoolean ($ : SpecRuntime, argument : Wrapped<unknown>) {
  if (($.condition(Number.MAX_SAFE_INTEGER - 707, $.isType(argument, "boolean"))))
  {
    return argument;
  }

  if ((((((($.condition(Number.MAX_SAFE_INTEGER - 708, $.is(argument, $.base<undefined>(undefined, []))) || $.condition(Number.MAX_SAFE_INTEGER - 709, $.is(argument, $.base<null>(null, [])))) || $.condition(Number.MAX_SAFE_INTEGER - 710, $.is(argument, $.base<number>(0, [])))) || $.condition(Number.MAX_SAFE_INTEGER - 711, $.is(argument, $.base<number>(0, [])))) || $.condition(Number.MAX_SAFE_INTEGER - 712, $.isNaN(argument as Wrapped<number>))) || $.condition(Number.MAX_SAFE_INTEGER - 713, $.is(argument, $.base<bigint>(0n, [])))) || $.condition(Number.MAX_SAFE_INTEGER - 714, $.is(argument, $.base<string>("", [])))))
  {
    return $.base<boolean>(false, []);
  }

  return $.base<boolean>(true, []);
}
