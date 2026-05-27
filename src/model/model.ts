import type { SpecOps } from './type.js';
import { StringModel } from './string.js';

export class Model {

  // --- static properties and methods ---
  static SUPPORTED_BUILTINS = new Set<Function>([
    String.prototype.at,
  ]);

  static support(f: Function): boolean {
    return this.SUPPORTED_BUILTINS.has(f);
  }

  // --- instance properties and methods ---
  
  String: StringModel;

  constructor(specOps: SpecOps) {
    this.String = new StringModel(specOps);
  }

  of(f: Function): Function {
    switch (f) {
      case String.prototype.at: return this.String.at.bind(this.String);
    }
    throw new Error(`Unsupported built-in function: ${f.name}`);
  }

}