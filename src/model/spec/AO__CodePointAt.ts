
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, BootStrap } from "@/model/type.js";

import { AO__UTF16SurrogatePairToCodePoint } from "./AO__UTF16SurrogatePairToCodePoint.js";

export function AO__CodePointAt ($ : BootStrap, string : Wrapped<string>, position : Wrapped<number>) {
  var size = $.length(string);
  var first = $.codeUnitAt(string, position);
  throw new Error("YET: Let _cp_ be the code point whose numeric value is the numeric value of _first_.")
  if (throw new Error("YET: _first_ is neither a leading surrogate nor a trailing surrogate"))
  {
    return {"CodePoint": cp, "CodeUnitCount": $.base<number>(1, []), "IsUnpairedSurrogate": $.base<boolean>(false, [])};
  }

  if (throw new Error("YET: _first_ is a trailing surrogate or _position_ + 1 = _size_"))
  {
    return {"CodePoint": cp, "CodeUnitCount": $.base<number>(1, []), "IsUnpairedSurrogate": $.base<boolean>(true, [])};
  }

  var second = $.codeUnitAt(string, $.add(position, $.base<number>(1, [])));
  if (throw new Error("YET: _second_ is not a trailing surrogate"))
  {
    return {"CodePoint": cp, "CodeUnitCount": $.base<number>(1, []), "IsUnpairedSurrogate": $.base<boolean>(true, [])};
  }

  cp = AO__UTF16SurrogatePairToCodePoint($, (first as Wrapped<unknown>), (second as Wrapped<unknown>));
  return {"CodePoint": cp, "CodeUnitCount": $.base<number>(2, []), "IsUnpairedSurrogate": $.base<boolean>(false, [])};
}
