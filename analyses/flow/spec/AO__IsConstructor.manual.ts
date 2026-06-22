import { CAPTURED } from '@/captured.js';
import type { Wrapped, SpecRuntime } from "../type.js";

export function AO__IsConstructor ($ : SpecRuntime, argument : Wrapped<unknown>) {
  // this is incorrect because side-effect happens?
  const f = $.peek(argument);
  if (typeof f !== 'function') {
    return $.base<boolean>(false, []);
  }

  const stringified = CAPTURED.FunctionToString.call(f).replaceAll(' ', '');
  if (stringified.startsWith('class') || stringified.startsWith('function')) {
    return $.base<boolean>(true, []);
  }
  return $.base<boolean>(false, []);
}
