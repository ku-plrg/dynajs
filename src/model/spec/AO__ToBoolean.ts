
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, BootStrap } from "@/model/type.js";

export function AO__ToBoolean ($ : BootStrap, argument : Wrapped<unknown>) {
  if (($.isType(argument, "boolean")))
  {
    return argument;
  }

  if ((((((($.is(argument, $.base<undefined>(undefined, [])) || $.is(argument, $.base<null>(null, []))) || $.is(argument, $.base<number>(0, []))) || $.is(argument, $.base<number>(0, []))) || $.isNaN(argument as Wrapped<number>)) || $.is(argument, $.base<bigint>(0n, []))) || $.is(argument, $.base<string>("", []))))
  {
    return $.base<boolean>(false, []);
  }

  return $.base<boolean>(true, []);
}
