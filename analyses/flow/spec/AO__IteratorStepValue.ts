// @ts-nocheck
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__IteratorStep } from "./AO__IteratorStep.js";
import { AO__IteratorValue } from "./AO__IteratorValue.js";

export function AO__IteratorStepValue ($ : SpecRuntime, iteratorRecord : Lifted<unknown>) {
  var result = AO__IteratorStep($, (iteratorRecord as Lifted<unknown>));
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 615, $.is(result, $.default<string>("done", [])))))
  {
    return $.default<string>("done", []);
  }

  try
  {
    var value = AO__IteratorValue($, (result as Lifted<unknown>));
    var value_kind = $.default<string>("normal", []);
  }
  catch(_value_err)
  {
    value = _value_err;
    var value_kind = $.default<string>("abrupt", []);
  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 616, $.is(value_kind, $.default<string>("abrupt", [])))))
  {
    iteratorRecord["Done" /* TODO INTERNAL : internal access */] = $.default<boolean>(true, []);
  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 617, $.is(value_kind, $.default<string>("abrupt", [])))))
  {
    throw value;
  }
  else
  {
    return value;
  }

}
