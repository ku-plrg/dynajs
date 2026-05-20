import type { SpecOps } from './type.js';
import { StringModel } from './string.js';

export class Model<Str>{

  // --- static properties and methods ---
  static SUPPORTED_BUILTINS = new Set<Function>([
    String.prototype.at,
  ]);

  static support(f: Function): boolean {
    return this.SUPPORTED_BUILTINS.has(f);
  }

  // --- instance properties and methods ---
  
  String: StringModel<Str>;

  constructor(
    specOps: SpecOps<Str, unknown, unknown, unknown, unknown>
  ) {
    this.String = new StringModel<Str>(specOps);
  }

  of(f: Function): Function {
    if (f === String.prototype.at) {
      return this.String.at
    }
    throw new Error(`Unsupported built-in function: ${f.name}`);
  }

}