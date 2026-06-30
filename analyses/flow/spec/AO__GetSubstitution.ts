// @ts-nocheck
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__Get } from "./AO__Get.js";
import { AO__StringIndexOf } from "./AO__StringIndexOf.js";
import { AO__StringToNumber } from "./AO__StringToNumber.js";
import { AO__ToString } from "./AO__ToString.js";

export function AO__GetSubstitution ($ : SpecRuntime, matched : Lifted<string>, str : Lifted<string>, position : Lifted<number>, captures : Lifted<string | undefined>[], namedCaptures : Lifted<unknown>, replacementTemplate : Lifted<string>) {
  var stringLength = $.length(str);
  var result = $.default<string>("", []);
  var templateRemainder = replacementTemplate;
  while (!$.value($.condition(Number.MAX_SAFE_INTEGER - 75, $.is(templateRemainder, $.default<string>("", [])))))
  {
    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 76, $.is($.substring(templateRemainder, $.default(0, []), $.default(2, [])), $.default("$$", [])))))
    {
      var ref = $.default<string>("$$", []);
      var refReplacement = $.default<string>("$", []);
    }
    else
    {
      if ($.value($.condition(Number.MAX_SAFE_INTEGER - 77, $.is($.substring(templateRemainder, $.default(0, []), $.default(2, [])), $.default("$`", [])))))
      {
        var ref = $.default<string>("$`", []);
        var refReplacement = $.substring(str, ($.default<number>(0, []) as Lifted<number>), (position as Lifted<number>));
      }
      else
      {
        if ($.value($.condition(Number.MAX_SAFE_INTEGER - 78, $.is($.substring(templateRemainder, $.default(0, []), $.default(2, [])), $.default("$&", [])))))
        {
          var ref = $.default<string>("$&", []);
          var refReplacement = matched;
        }
        else
        {
          if ($.value($.condition(Number.MAX_SAFE_INTEGER - 79, $.is($.substring(templateRemainder, $.default(0, []), $.default(2, [])), $.default("$'", [])))))
          {
            var ref = $.default<string>("$'", []);
            var matchLength = $.length(matched);
            var tailPos = $.add((position as Lifted<number>), (matchLength as Lifted<number>));
            var refReplacement = $.substring(str, ($.min(tailPos, stringLength) as Lifted<number>), $.length(str));
          }
          else
          {
            if ($.value($.condition(Number.MAX_SAFE_INTEGER - 80, $.is($.substring(templateRemainder, $.default(0, []), $.default(1, [])), $.default("$", [])) && /[0-9]/.test($.value($.substring(templateRemainder, $.default(1, []), $.default(2, [])))))))
            {
              var digitCount = /[0-9]/.test($.value($.substring(templateRemainder, $.default(2, []), $.default(3, [])))) ? $.default<number>(2, []) : $.default<number>(1, []);
              var digits = $.substring(templateRemainder, ($.default<number>(1, []) as Lifted<number>), ($.add(($.default<number>(1, []) as Lifted<number>), (digitCount as Lifted<number>)) as Lifted<number>));
              var index = AO__StringToNumber($, (digits as Lifted<string>));
              var captureLen = $.default<number>(captures.length, []);
              if ($.value($.condition(Number.MAX_SAFE_INTEGER - 81, $.greaterThan(index, captureLen))) && $.value($.condition(Number.MAX_SAFE_INTEGER - 82, $.is(digitCount, $.default<number>(2, [])))))
              {
                digitCount = $.default<number>(1, []);
                digits = $.substring(digits, ($.default<number>(0, []) as Lifted<number>), ($.default<number>(1, []) as Lifted<number>));
                index = AO__StringToNumber($, (digits as Lifted<string>));
              }

              var ref = $.substring(templateRemainder, ($.default<number>(0, []) as Lifted<number>), ($.add(($.default<number>(1, []) as Lifted<number>), (digitCount as Lifted<number>)) as Lifted<number>));
              if (($.value($.condition(Number.MAX_SAFE_INTEGER - 83, $.greaterThanEqual(index, $.default<number>(1, [])))) && $.value($.condition(Number.MAX_SAFE_INTEGER - 84, $.lessThanEqual(index, captureLen)))))
              {
                var capture = captures[$.subtract((index as Lifted<number>), ($.default<number>(1, []) as Lifted<number>))];
                if ($.value($.condition(Number.MAX_SAFE_INTEGER - 85, $.is(capture, $.default<undefined>(undefined, [])))))
                {
                  var refReplacement = $.default<string>("", []);
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
              if ($.value($.condition(Number.MAX_SAFE_INTEGER - 86, $.is($.substring(templateRemainder, $.default(0, []), $.default(2, [])), $.default("$<", [])))))
              {
                var gtPos = AO__StringIndexOf($, (templateRemainder as Lifted<string>), ($.default<string>(">", []) as Lifted<string>), ($.default<number>(0, []) as Lifted<number>));
                if ($.value($.condition(Number.MAX_SAFE_INTEGER - 87, $.is(gtPos, $.default<number>(-1, [])))) || $.value($.condition(Number.MAX_SAFE_INTEGER - 88, $.is(namedCaptures, $.default<undefined>(undefined, [])))))
                {
                  var ref = $.default<string>("$<", []);
                  var refReplacement = ref;
                }
                else
                {
                  var ref = $.substring(templateRemainder, ($.default<number>(0, []) as Lifted<number>), ($.add((gtPos as Lifted<number>), ($.default<number>(1, []) as Lifted<number>)) as Lifted<number>));
                  var groupName = $.substring(templateRemainder, ($.default<number>(2, []) as Lifted<number>), (gtPos as Lifted<number>));
                  var capture = AO__Get($, (namedCaptures as Lifted<unknown>), (groupName as Lifted<unknown>));
                  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 89, $.is(capture, $.default<undefined>(undefined, [])))))
                  {
                    var refReplacement = $.default<string>("", []);
                  }
                  else
                  {
                    var refReplacement = AO__ToString($, (capture as Lifted<unknown>));
                  }

                }

              }
              else
              {
                var ref = $.substring(templateRemainder, ($.default<number>(0, []) as Lifted<number>), ($.default<number>(1, []) as Lifted<number>));
                var refReplacement = ref;
              }

            }

          }

        }

      }

    }

    var refLength = $.length(ref);
    templateRemainder = $.substring(templateRemainder, (refLength as Lifted<number>), $.length(templateRemainder));
    result = $.concatenate(result, refReplacement);
  }

  return result;
}
