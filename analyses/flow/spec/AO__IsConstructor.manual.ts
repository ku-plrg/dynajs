import { CAPTURED } from '../../../src/captured.js';
import type { Lifted, SpecRuntime } from "../type.js";

export function AO__IsConstructor ($ : SpecRuntime, argument : Lifted<unknown>) {
  // this is incorrect because side-effect happens?
  const f = $.value(argument);
  if (typeof f !== 'function') {
    return $.default<boolean>(false, []);
  }

  const stringified = CAPTURED.FunctionToString.call(f).replaceAll(' ', '');
  if (stringified.startsWith('class') || stringified.startsWith('function')) {
    return $.default<boolean>(true, []);
  }
  return $.default<boolean>(false, []);
}
