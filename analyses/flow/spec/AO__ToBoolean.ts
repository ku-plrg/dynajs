// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

export function AO__ToBoolean ($ : SpecRuntime, argument : Lifted<unknown>) {
  if (($.value($.condition(Number.MAX_SAFE_INTEGER - 784, $.isType(argument, "boolean")))))
  {
    return argument;
  }

  if ((((((($.value($.condition(Number.MAX_SAFE_INTEGER - 785, $.is(argument, $.default<undefined>(undefined, [])))) || $.value($.condition(Number.MAX_SAFE_INTEGER - 786, $.is(argument, $.default<null>(null, []))))) || $.value($.condition(Number.MAX_SAFE_INTEGER - 787, $.is(argument, $.default<number>(0, []))))) || $.value($.condition(Number.MAX_SAFE_INTEGER - 788, $.is(argument, $.default<number>(0, []))))) || $.value($.condition(Number.MAX_SAFE_INTEGER - 789, $.isNaN(argument as Lifted<number>)))) || $.value($.condition(Number.MAX_SAFE_INTEGER - 790, $.is(argument, $.default<bigint>(0n, []))))) || $.value($.condition(Number.MAX_SAFE_INTEGER - 791, $.is(argument, $.default<string>("", []))))))
  {
    return $.default<boolean>(false, []);
  }

  return $.default<boolean>(true, []);
}
