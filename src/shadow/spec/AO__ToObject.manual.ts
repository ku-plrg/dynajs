import type { LiftedTransferOps, Lifted, Unlifted, Primitive } from "../type.js";

import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";

export function AO__ToObject($: LiftedTransferOps, argument: Lifted<unknown>): Lifted<object> {
  "use strict";

  AO__RequireObjectCoercible($, argument);

  if (typeof $.value(argument) === 'object') return argument as Lifted<object>;

  return $.default(Object(argument), []);
}
