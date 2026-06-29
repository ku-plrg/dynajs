// @ts-nocheck
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__Call } from "./AO__Call.js";
import { AO__GetMethod } from "./AO__GetMethod.js";

export function AO__IteratorClose ($ : SpecRuntime, iteratorRecord : Lifted<unknown>, completion_kind : Lifted<unknown>, completion : Lifted<unknown>) {
  var iterator = iteratorRecord["Iterator" /* TODO INTERNAL : internal access */];
  try
  {
    var innerResult = AO__GetMethod($, (iterator as Lifted<unknown>), ($.default<string>("return", []) as Lifted<unknown>));
    var innerResult_kind = $.default<string>("normal", []);
  }
  catch(_innerResult_err)
  {
    innerResult = _innerResult_err;
    var innerResult_kind = $.default<string>("abrupt", []);
  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 600, $.is(innerResult_kind, $.default<string>("normal", [])))))
  {
    var return_var = innerResult;
    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 601, $.is(return_var, $.default<undefined>(undefined, [])))))
    {
      if ($.value($.condition(Number.MAX_SAFE_INTEGER - 602, $.is(completion_kind, $.default<string>("abrupt", [])))))
      {
        throw completion;
      }
      else
      {
        return completion;
      }

    }

    try
    {
      innerResult = AO__Call($, (return_var as Lifted<unknown>), (iterator as Lifted<unknown>));
      var innerResult_kind = $.default<string>("normal", []);
    }
    catch(_innerResult_err)
    {
      innerResult = _innerResult_err;
      var innerResult_kind = $.default<string>("abrupt", []);
    }

  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 603, $.is(completion_kind, $.default<string>("abrupt", [])))))
  {
    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 604, $.is(completion_kind, $.default<string>("abrupt", [])))))
    {
      throw completion;
    }
    else
    {
      return completion;
    }

  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 605, $.is(innerResult_kind, $.default<string>("abrupt", [])))))
  {
    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 606, $.is(innerResult_kind, $.default<string>("abrupt", [])))))
    {
      throw innerResult;
    }
    else
    {
      return innerResult;
    }

  }

  if (!($.value($.condition(Number.MAX_SAFE_INTEGER - 607, $.isType(innerResult, "object")))))
  {
    throw new TypeError;
  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 608, $.is(completion_kind, $.default<string>("abrupt", [])))))
  {
    throw completion;
  }
  else
  {
    return completion;
  }

}
