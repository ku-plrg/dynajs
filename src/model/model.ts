import * as string from './string.js';

export const SUPPORTED_BUILTINS = new Map<Function, Function>(([
  // @ts-ignore update build target
  [String.prototype.at, string.at],
  [String.prototype.substring, string.substring],
  [String.prototype.split, string.split],
  [String.prototype.replace, string.replace],
] satisfies [Function, Function][])
.filter(([f, g]) => typeof f === 'function' && typeof g === 'function'));

// export const model = {
//   String: {
//     prototype: {
//       at: string.at
//     }
//   }
// };