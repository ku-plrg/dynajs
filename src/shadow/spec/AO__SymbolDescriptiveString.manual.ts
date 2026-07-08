import type { LiftedTransferOps, Lifted, Unlifted } from "../type.js";

export function AO__SymbolDescriptiveString ($ : LiftedTransferOps, sym : Lifted<symbol>) {
  var desc = $.default<string | undefined>($.value(sym).description, []);
  if ($.value($.is(desc, $.default<undefined>(undefined, []))))
  {
    desc = $.default<string>("", []);
  }

  return $.concatenate($.concatenate($.default<string>("Symbol(", []), desc), $.default<string>(")", []));
}
