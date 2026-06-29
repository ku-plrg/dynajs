// @ts-nocheck
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__Call } from "./AO__Call.js";

export function AO__IteratorNext ($ : SpecRuntime, iteratorRecord : Lifted<unknown>, value : Lifted<unknown> = $.default<undefined>(undefined, [])) {
  var valueIsPresent = arguments.length > 2;
  if (!valueIsPresent)
  {
    try
    {
      var result = AO__Call($, (iteratorRecord["NextMethod" /* TODO INTERNAL : internal access */] as Lifted<unknown>), (iteratorRecord["Iterator" /* TODO INTERNAL : internal access */] as Lifted<unknown>));
      var result_kind = $.default<string>("normal", []);
    }
    catch(_result_err)
    {
      result = _result_err;
      var result_kind = $.default<string>("abrupt", []);
    }

  }
  else
  {
    try
    {
      var result = AO__Call($, (iteratorRecord["NextMethod" /* TODO INTERNAL : internal access */] as Lifted<unknown>), (iteratorRecord["Iterator" /* TODO INTERNAL : internal access */] as Lifted<unknown>), ([value] as Lifted<unknown>[]));
      var result_kind = $.default<string>("normal", []);
    }
    catch(_result_err)
    {
      result = _result_err;
      var result_kind = $.default<string>("abrupt", []);
    }

  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 609, $.is(result_kind, $.default<string>("abrupt", [])))))
  {
    iteratorRecord["Done" /* TODO INTERNAL : internal access */] = $.default<boolean>(true, []);
    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 610, $.is(result_kind, $.default<string>("abrupt", [])))))
    {
      throw result;
    }
    else
    {
      return result;
    }

  }

  result = result;
  if (!($.value($.condition(Number.MAX_SAFE_INTEGER - 611, $.isType(result, "object")))))
  {
    iteratorRecord["Done" /* TODO INTERNAL : internal access */] = $.default<boolean>(true, []);
    throw new TypeError;
  }

  return result;
}
