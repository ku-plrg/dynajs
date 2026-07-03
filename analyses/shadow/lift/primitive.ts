import util from 'node:util';
import type { Primitive } from '../type.js';

export class LiftedPrimitive {
  constructor(private readonly value: Primitive) {}

  [Symbol.toPrimitive](hint: 'string' | 'number' | 'default') {
    // TODO print a coercion warning if DEBUG is given

    if (this.value === null || this.value === undefined) return this.value;
    // if (hint === 'string') return this.value.toString();
    // else return this.value.valueOf();
    return this.value; // this is more faithful?
  }

  get [Symbol.iterator]() {
    if (typeof this.value === 'undefined' || this.value === null) {
      return undefined;
    } else {
      return this.SymbolIterator.bind(this);
    }
  }

  SymbolIterator() {
    if (typeof this.value === 'string') {
      return this.value[Symbol.iterator]();
    }
    throw new TypeError('not iterable');
  }

  [util.inspect.custom]() {
    return '<lifted-primitive>';
  }
}