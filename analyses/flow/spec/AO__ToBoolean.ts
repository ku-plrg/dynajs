// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

export function AO__ToBoolean ($ : SpecRuntime, argument : Lifted<unknown>) {
  if (($.condition(Number.MAX_SAFE_INTEGER - 730, $.isType(argument, "boolean"))))
  {
    return argument;
  }

  if ((((((($.condition(Number.MAX_SAFE_INTEGER - 731, $.is(argument, $.lit<undefined>(undefined))) || $.condition(Number.MAX_SAFE_INTEGER - 732, $.is(argument, $.lit<null>(null)))) || $.condition(Number.MAX_SAFE_INTEGER - 733, $.is(argument, $.lit<number>(0)))) || $.condition(Number.MAX_SAFE_INTEGER - 734, $.is(argument, $.lit<number>(0)))) || $.condition(Number.MAX_SAFE_INTEGER - 735, $.isNaN(argument as Lifted<number>))) || $.condition(Number.MAX_SAFE_INTEGER - 736, $.is(argument, $.lit<bigint>(0n)))) || $.condition(Number.MAX_SAFE_INTEGER - 737, $.is(argument, $.lit<string>("")))))
  {
    return $.lit<boolean>(false);
  }

  return $.lit<boolean>(true);
}
