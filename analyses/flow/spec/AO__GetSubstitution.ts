// @ts-nocheck
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "../type.js";

import { AO__Get } from "./AO__Get.js";
import { AO__StringIndexOf } from "./AO__StringIndexOf.js";
import { AO__StringToNumber } from "./AO__StringToNumber.js";
import { AO__ToString } from "./AO__ToString.js";

export function AO__GetSubstitution ($ : SpecRuntime, matched : Wrapped<string>, str : Wrapped<string>, position : Wrapped<number>, captures : Wrapped<string | undefined>[], namedCaptures : Wrapped<unknown>, replacementTemplate : Wrapped<string>) {
  var stringLength = $.length(str);
  var result = $.lit<string>("");
  var templateRemainder = replacementTemplate;
  while (!$.condition(Number.MAX_SAFE_INTEGER - 72, $.is(templateRemainder, $.lit<string>(""))))
  {
    if ($.condition(Number.MAX_SAFE_INTEGER - 73, $.is($.substring(templateRemainder, $.base(0, []), $.base(2, [])), $.base("$$", []))))
    {
      var ref = $.lit<string>("$$");
      var refReplacement = $.lit<string>("$");
    }
    else
    {
      if ($.condition(Number.MAX_SAFE_INTEGER - 74, $.is($.substring(templateRemainder, $.base(0, []), $.base(2, [])), $.base("$`", []))))
      {
        var ref = $.lit<string>("$`");
        var refReplacement = $.substring(str, ($.lit<number>(0) as Wrapped<number>), (position as Wrapped<number>));
      }
      else
      {
        if ($.condition(Number.MAX_SAFE_INTEGER - 75, $.is($.substring(templateRemainder, $.base(0, []), $.base(2, [])), $.base("$&", []))))
        {
          var ref = $.lit<string>("$&");
          var refReplacement = matched;
        }
        else
        {
          if ($.condition(Number.MAX_SAFE_INTEGER - 76, $.is($.substring(templateRemainder, $.base(0, []), $.base(2, [])), $.base("$'", []))))
          {
            var ref = $.lit<string>("$'");
            var matchLength = $.length(matched);
            var tailPos = $.add((position as Wrapped<number>), (matchLength as Wrapped<number>));
            var refReplacement = $.substring(str, ($.min(tailPos, stringLength) as Wrapped<number>), $.length(str));
          }
          else
          {
            if ($.condition(Number.MAX_SAFE_INTEGER - 77, $.is($.substring(templateRemainder, $.base(0, []), $.base(1, [])), $.base("$", [])) && /[0-9]/.test($.peek($.substring(templateRemainder, $.base(1, []), $.base(2, []))))))
            {
              var digitCount = /[0-9]/.test($.peek($.substring(templateRemainder, $.base(2, []), $.base(3, [])))) ? $.base<number>(2, []) : $.base<number>(1, []);
              var digits = $.substring(templateRemainder, ($.lit<number>(1) as Wrapped<number>), ($.add(($.lit<number>(1) as Wrapped<number>), (digitCount as Wrapped<number>)) as Wrapped<number>));
              var index = AO__StringToNumber($, (digits as Wrapped<string>));
              var captureLen = $.base<number>(captures.length, []);
              if ($.condition(Number.MAX_SAFE_INTEGER - 78, $.greaterThan(index, captureLen)) && $.condition(Number.MAX_SAFE_INTEGER - 79, $.is(digitCount, $.lit<number>(2))))
              {
                digitCount = $.lit<number>(1);
                digits = $.substring(digits, ($.lit<number>(0) as Wrapped<number>), ($.lit<number>(1) as Wrapped<number>));
                index = AO__StringToNumber($, (digits as Wrapped<string>));
              }

              var ref = $.substring(templateRemainder, ($.lit<number>(0) as Wrapped<number>), ($.add(($.lit<number>(1) as Wrapped<number>), (digitCount as Wrapped<number>)) as Wrapped<number>));
              if (($.condition(Number.MAX_SAFE_INTEGER - 80, $.greaterThanEqual(index, $.lit<number>(1))) && $.condition(Number.MAX_SAFE_INTEGER - 81, $.lessThanEqual(index, captureLen))))
              {
                var capture = captures[$.subtract((index as Wrapped<number>), ($.lit<number>(1) as Wrapped<number>))];
                if ($.condition(Number.MAX_SAFE_INTEGER - 82, $.is(capture, $.lit<undefined>(undefined))))
                {
                  var refReplacement = $.lit<string>("");
                }
                else
                {
                  var refReplacement = capture;
                }

              }
              else
              {
                var refReplacement = ref;
              }

            }
            else
            {
              if ($.condition(Number.MAX_SAFE_INTEGER - 83, $.is($.substring(templateRemainder, $.base(0, []), $.base(2, [])), $.base("$<", []))))
              {
                var gtPos = AO__StringIndexOf($, (templateRemainder as Wrapped<string>), ($.lit<string>(">") as Wrapped<string>), ($.lit<number>(0) as Wrapped<number>));
                if ($.condition(Number.MAX_SAFE_INTEGER - 84, $.is(gtPos, $.lit<string>("not-found"))) || $.condition(Number.MAX_SAFE_INTEGER - 85, $.is(namedCaptures, $.lit<undefined>(undefined))))
                {
                  var ref = $.lit<string>("$<");
                  var refReplacement = ref;
                }
                else
                {
                  var ref = $.substring(templateRemainder, ($.lit<number>(0) as Wrapped<number>), ($.add((gtPos as Wrapped<number>), ($.lit<number>(1) as Wrapped<number>)) as Wrapped<number>));
                  var groupName = $.substring(templateRemainder, ($.lit<number>(2) as Wrapped<number>), (gtPos as Wrapped<number>));
                  var capture = AO__Get($, (namedCaptures as Wrapped<unknown>), (groupName as Wrapped<unknown>));
                  if ($.condition(Number.MAX_SAFE_INTEGER - 86, $.is(capture, $.lit<undefined>(undefined))))
                  {
                    var refReplacement = $.lit<string>("");
                  }
                  else
                  {
                    var refReplacement = AO__ToString($, (capture as Wrapped<unknown>));
                  }

                }

              }
              else
              {
                var ref = $.substring(templateRemainder, ($.lit<number>(0) as Wrapped<number>), ($.lit<number>(1) as Wrapped<number>));
                var refReplacement = ref;
              }

            }

          }

        }

      }

    }

    var refLength = $.length(ref);
    templateRemainder = $.substring(templateRemainder, (refLength as Wrapped<number>), $.length(templateRemainder));
    result = $.concatenate(result, refReplacement);
  }

  return result;
}
