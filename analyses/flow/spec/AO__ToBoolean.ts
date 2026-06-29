// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

export function AO__ToBoolean ($ : SpecRuntime, argument : Lifted<unknown>) {
  if (($.value($.condition(Number.MAX_SAFE_INTEGER - 794, $.isType(argument, "boolean")))))
  {
    return argument;
  }

  if ((((((($.value($.condition(Number.MAX_SAFE_INTEGER - 795, $.is(argument, $.default<undefined>(undefined, [])))) || $.value($.condition(Number.MAX_SAFE_INTEGER - 796, $.is(argument, $.default<null>(null, []))))) || $.value($.condition(Number.MAX_SAFE_INTEGER - 797, $.is(argument, $.default<number>(0, []))))) || $.value($.condition(Number.MAX_SAFE_INTEGER - 798, $.is(argument, $.default<number>(0, []))))) || $.value($.condition(Number.MAX_SAFE_INTEGER - 799, $.isNaN(argument as Lifted<number>)))) || $.value($.condition(Number.MAX_SAFE_INTEGER - 800, $.is(argument, $.default<bigint>(0n, []))))) || $.value($.condition(Number.MAX_SAFE_INTEGER - 801, $.is(argument, $.default<string>("", []))))))
  {
    return $.default<boolean>(false, []);
  }

  return $.default<boolean>(true, []);
}
