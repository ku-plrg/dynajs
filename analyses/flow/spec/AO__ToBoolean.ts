// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

export function AO__ToBoolean ($ : SpecRuntime, argument : Lifted<unknown>) {
  if (($.value($.condition(Number.MAX_SAFE_INTEGER - 730, $.isType(argument, "boolean")))))
  {
    return argument;
  }

  if ((((((($.value($.condition(Number.MAX_SAFE_INTEGER - 731, $.is(argument, $.default<undefined>(undefined, [])))) || $.value($.condition(Number.MAX_SAFE_INTEGER - 732, $.is(argument, $.default<null>(null, []))))) || $.value($.condition(Number.MAX_SAFE_INTEGER - 733, $.is(argument, $.default<number>(0, []))))) || $.value($.condition(Number.MAX_SAFE_INTEGER - 734, $.is(argument, $.default<number>(0, []))))) || $.value($.condition(Number.MAX_SAFE_INTEGER - 735, $.isNaN(argument as Lifted<number>)))) || $.value($.condition(Number.MAX_SAFE_INTEGER - 736, $.is(argument, $.default<bigint>(0n, []))))) || $.value($.condition(Number.MAX_SAFE_INTEGER - 737, $.is(argument, $.default<string>("", []))))))
  {
    return $.default<boolean>(false, []);
  }

  return $.default<boolean>(true, []);
}
