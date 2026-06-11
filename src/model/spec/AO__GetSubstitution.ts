
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

import { AO__Get } from "./AO__Get.js";
import { AO__StringIndexOf } from "./AO__StringIndexOf.js";
import { AO__StringToNumber } from "./AO__StringToNumber.js";
import { AO__ToString } from "./AO__ToString.js";

export function AO__GetSubstitution ($ : SpecRuntime, matched : Wrapped<string>, str : Wrapped<string>, position : Wrapped<number>, captures : Wrapped<string | undefined>[], namedCaptures : Wrapped<unknown>, replacementTemplate : Wrapped<string>) {
  var stringLength = $.length(str);
  var result = $.base<string>("", []);
  var templateRemainder = replacementTemplate;
  while (!$.is(templateRemainder, $.base<string>("", [])))
  {
    if ($.is($.substring(templateRemainder, $.base(0, []), $.base(2, [])), $.base("$$", [])))
    {
      var ref = $.base<string>("$$", []);
      var refReplacement = $.base<string>("$", []);
    }
    else
    {
      if ($.is($.substring(templateRemainder, $.base(0, []), $.base(2, [])), $.base("$`", [])))
      {
        var ref = $.base<string>("$`", []);
        var refReplacement = $.substring(str, $.base<number>(0, []), position);
      }
      else
      {
        if ($.is($.substring(templateRemainder, $.base(0, []), $.base(2, [])), $.base("$&", [])))
        {
          var ref = $.base<string>("$&", []);
          var refReplacement = matched;
        }
        else
        {
          if ($.is($.substring(templateRemainder, $.base(0, []), $.base(2, [])), $.base("$'", [])))
          {
            var ref = $.base<string>("$'", []);
            var matchLength = $.length(matched);
            var tailPos = $.add(position, matchLength);
            var refReplacement = $.substring(str, $.min(tailPos, stringLength), $.length(str));
          }
          else
          {
            if ($.is($.substring(templateRemainder, $.base(0, []), $.base(1, [])), $.base("$", [])) && /[0-9]/.test($.peek($.substring(templateRemainder, $.base(1, []), $.base(2, [])))))
            {
              var digitCount = /[0-9]/.test($.peek($.substring(templateRemainder, $.base(2, []), $.base(3, [])))) ? $.base<number>(2, []) : $.base<number>(1, []);
              var digits = $.substring(templateRemainder, $.base<number>(1, []), $.add($.base<number>(1, []), digitCount));
              var index = AO__StringToNumber($, (digits as Wrapped<string>));
              var captureLen = $.base<number>(captures.length, []);
              if ($.condition(0, $.greaterThan(index, captureLen)) && $.is(digitCount, $.base<number>(2, [])))
              {
                digitCount = $.base<number>(1, []);
                digits = $.substring(digits, $.base<number>(0, []), $.base<number>(1, []));
                index = AO__StringToNumber($, (digits as Wrapped<string>));
              }

              var ref = $.substring(templateRemainder, $.base<number>(0, []), $.add($.base<number>(1, []), digitCount));
              if (($.condition(1, $.greaterThanEqual(index, $.base<number>(1, []))) && $.condition(2, $.lessThanEqual(index, captureLen))))
              {
                var capture = captures[$.subtract(index, $.base<number>(1, []))];
                if ($.is(capture, $.base<undefined>(undefined, [])))
                {
                  var refReplacement = $.base<string>("", []);
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
              if ($.is($.substring(templateRemainder, $.base(0, []), $.base(2, [])), $.base("$<", [])))
              {
                var gtPos = AO__StringIndexOf($, (templateRemainder as Wrapped<string>), ($.base<string>(">", []) as Wrapped<string>), ($.base<number>(0, []) as Wrapped<number>));
                if ($.is(gtPos, $.base<string>("not-found", [])) || $.is(namedCaptures, $.base<undefined>(undefined, [])))
                {
                  var ref = $.base<string>("$<", []);
                  var refReplacement = ref;
                }
                else
                {
                  var ref = $.substring(templateRemainder, $.base<number>(0, []), $.add(gtPos, $.base<number>(1, [])));
                  var groupName = $.substring(templateRemainder, $.base<number>(2, []), gtPos);
                  var capture = AO__Get($, (namedCaptures as Wrapped<unknown>), (groupName as Wrapped<unknown>));
                  if ($.is(capture, $.base<undefined>(undefined, [])))
                  {
                    var refReplacement = $.base<string>("", []);
                  }
                  else
                  {
                    var refReplacement = AO__ToString($, (capture as Wrapped<unknown>));
                  }

                }

              }
              else
              {
                var ref = $.substring(templateRemainder, $.base<number>(0, []), $.base<number>(1, []));
                var refReplacement = ref;
              }

            }

          }

        }

      }

    }

    var refLength = $.length(ref);
    templateRemainder = $.substring(templateRemainder, refLength, $.length(templateRemainder));
    result = $.concatenate(result, refReplacement);
  }

  return result;
}
