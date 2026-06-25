// @manual
// String.prototype.matchAll — yields one match array per global match. Built
// like exec/match (captures recovered as substrings of the subject, so taint is
// offset-precise), iterated natively for the match positions. Returns an array
// of match arrays (iterable; the common `[...s.matchAll(re)]` spread works). A
// non-RegExp pattern falls back to the native result.
import type { Lifted, SpecRuntime } from "../type.js";

import { AO__ArrayCreate } from "./AO__ArrayCreate.js";
import { AO__CreateDataPropertyOrThrow } from "./AO__CreateDataPropertyOrThrow.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_String_prototype_matchAll($: SpecRuntime, $this: Lifted<unknown>, regexp: Lifted<unknown> = $.default(undefined, [])) {
  var string = AO__ToString($, ($this as Lifted<unknown>));
  var re: unknown = $.value(regexp);
  var subject = $.value(string) as string;

  if (!(re instanceof RegExp)) {
    return subject.matchAll(re as RegExp) as unknown as Lifted<unknown>;
  }

  // matchAll requires a global regex; add `d` for per-capture spans.
  var flags = re.flags;
  var reD = new RegExp(re.source, (flags.includes("g") ? flags : flags + "g") + (flags.includes("d") ? "" : "d"));

  var out: unknown[] = [];
  for (var m of subject.matchAll(reD)) {
    var A = AO__ArrayCreate($, ($.default<number>(m.length, []) as Lifted<number>));
    for (var i = 0; i < m.length; i++) {
      var span = m.indices ? m.indices[i] : undefined;
      var cap = span
        ? $.substring((string as Lifted<string>), ($.default<number>(span[0], []) as Lifted<number>), ($.default<number>(span[1], []) as Lifted<number>))
        : $.default<string>(m[i] == null ? "" : (m[i] as string), []);
      AO__CreateDataPropertyOrThrow($, (A as Lifted<unknown>), ($.default<string>(String(i), []) as Lifted<unknown>), (cap as Lifted<unknown>));
    }
    AO__CreateDataPropertyOrThrow($, (A as Lifted<unknown>), ($.default<string>("index", []) as Lifted<unknown>), ($.default<number>(m.index ?? 0, []) as Lifted<unknown>));
    AO__CreateDataPropertyOrThrow($, (A as Lifted<unknown>), ($.default<string>("input", []) as Lifted<unknown>), (string as Lifted<unknown>));
    out.push(A);
  }
  // Array of match arrays — iterable, so `[...s.matchAll(re)]` works. (A true
  // RegExpStringIterator isn't modeled; the spread/for-of pattern is.)
  return out as unknown as Lifted<unknown>;
}
