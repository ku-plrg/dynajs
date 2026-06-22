// @manual
// String.prototype.matchAll — yields one match array per global match. Built
// like exec/match (captures recovered as substrings of the subject, so taint is
// offset-precise), iterated natively for the match positions. Returns an array
// of match arrays (iterable; the common `[...s.matchAll(re)]` spread works). A
// non-RegExp pattern falls back to the native result.
import type { Wrapped, SpecRuntime } from "../type.js";

import { AO__ArrayCreate } from "./AO__ArrayCreate.js";
import { AO__CreateDataPropertyOrThrow } from "./AO__CreateDataPropertyOrThrow.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_String_prototype_matchAll($: SpecRuntime, $this: Wrapped<unknown>, regexp: Wrapped<unknown> = $.undef) {
  var string = AO__ToString($, ($this as Wrapped<unknown>));
  var re: unknown = $.peek(regexp);
  var subject = $.peek(string) as string;

  if (!(re instanceof RegExp)) {
    return subject.matchAll(re as RegExp) as unknown as Wrapped<unknown>;
  }

  // matchAll requires a global regex; add `d` for per-capture spans.
  var flags = re.flags;
  var reD = new RegExp(re.source, (flags.includes("g") ? flags : flags + "g") + (flags.includes("d") ? "" : "d"));

  var out: unknown[] = [];
  for (var m of subject.matchAll(reD)) {
    var A = AO__ArrayCreate($, ($.base<number>(m.length, []) as Wrapped<number>));
    for (var i = 0; i < m.length; i++) {
      var span = m.indices ? m.indices[i] : undefined;
      var cap = span
        ? $.substring((string as Wrapped<string>), ($.base<number>(span[0], []) as Wrapped<number>), ($.base<number>(span[1], []) as Wrapped<number>))
        : $.base<string>(m[i] == null ? "" : (m[i] as string), []);
      AO__CreateDataPropertyOrThrow($, (A as Wrapped<unknown>), ($.base<string>(String(i), []) as Wrapped<unknown>), (cap as Wrapped<unknown>));
    }
    AO__CreateDataPropertyOrThrow($, (A as Wrapped<unknown>), ($.base<string>("index", []) as Wrapped<unknown>), ($.base<number>(m.index ?? 0, []) as Wrapped<unknown>));
    AO__CreateDataPropertyOrThrow($, (A as Wrapped<unknown>), ($.base<string>("input", []) as Wrapped<unknown>), (string as Wrapped<unknown>));
    out.push(A);
  }
  // Array of match arrays — iterable, so `[...s.matchAll(re)]` works. (A true
  // RegExpStringIterator isn't modeled; the spread/for-of pattern is.)
  return out as unknown as Wrapped<unknown>;
}
