// @ts-nocheck
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__IteratorComplete } from "./AO__IteratorComplete.js";
import { AO__IteratorNext } from "./AO__IteratorNext.js";

export function AO__IteratorStep ($ : SpecRuntime, iteratorRecord : Lifted<unknown>) {
  var result = AO__IteratorNext($, (iteratorRecord as Lifted<unknown>));
  try
  {
    var done = AO__IteratorComplete($, (result as Lifted<unknown>));
    var done_kind = $.default<string>("normal", []);
  }
  catch(_done_err)
  {
    done = _done_err;
    var done_kind = $.default<string>("abrupt", []);
  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 612, $.is(done_kind, $.default<string>("abrupt", [])))))
  {
    iteratorRecord["Done" /* TODO INTERNAL : internal access */] = $.default<boolean>(true, []);
    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 613, $.is(done_kind, $.default<string>("abrupt", [])))))
    {
      throw done;
    }
    else
    {
      return done;
    }

  }

  done = done;
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 614, $.is(done, $.default<boolean>(true, [])))))
  {
    iteratorRecord["Done" /* TODO INTERNAL : internal access */] = $.default<boolean>(true, []);
    return $.default<string>("done", []);
  }

  return result;
}
