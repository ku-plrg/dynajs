import type { SpecRuntime } from './type.js';
import * as generated from './spec/index.js';

export class Model {
  // --- static properties and methods ---
  static BUILTINS = new Map<Function, Function>(
    (
      [
        [String.fromCharCode, generated.INTRINSICS_String_fromCharCode],
        [String.fromCodePoint, generated.INTRINSICS_String_fromCodePoint],
        [String.raw, generated.INTRINSICS_String_raw],
        [String.prototype.at, generated.INTRINSICS_String_prototype_at],
        [String.prototype.charAt, generated.INTRINSICS_String_prototype_charAt],
        [
          String.prototype.charCodeAt,
          generated.INTRINSICS_String_prototype_charCodeAt,
        ],
        [
          String.prototype.codePointAt,
          generated.INTRINSICS_String_prototype_codePointAt,
        ],
        [String.prototype.concat, generated.INTRINSICS_String_prototype_concat],
        [
          String.prototype.endsWith,
          generated.INTRINSICS_String_prototype_endsWith,
        ],
        [
          String.prototype.includes,
          generated.INTRINSICS_String_prototype_includes,
        ],
        [
          String.prototype.indexOf,
          generated.INTRINSICS_String_prototype_indexOf,
        ],
        [
          String.prototype.isWellFormed,
          generated.INTRINSICS_String_prototype_isWellFormed,
        ],
        [
          String.prototype.lastIndexOf,
          generated.INTRINSICS_String_prototype_lastIndexOf,
        ],
        [
          String.prototype.localeCompare,
          generated.INTRINSICS_String_prototype_localeCompare,
        ],
        [
          String.prototype.normalize,
          generated.INTRINSICS_String_prototype_normalize,
        ],
        [String.prototype.padEnd, generated.INTRINSICS_String_prototype_padEnd],
        [
          String.prototype.padStart,
          generated.INTRINSICS_String_prototype_padStart,
        ],
        [String.prototype.repeat, generated.INTRINSICS_String_prototype_repeat],
        [
          String.prototype.replace,
          generated.INTRINSICS_String_prototype_replace,
        ],
        [
          String.prototype.replaceAll,
          generated.INTRINSICS_String_prototype_replaceAll,
        ],
        [String.prototype.slice, generated.INTRINSICS_String_prototype_slice],
        [String.prototype.split, generated.INTRINSICS_String_prototype_split],
        [
          String.prototype.startsWith,
          generated.INTRINSICS_String_prototype_startsWith,
        ],
        [String.prototype.substr, generated.INTRINSICS_String_prototype_substr],
        [
          String.prototype.substring,
          generated.INTRINSICS_String_prototype_substring,
        ],
        [
          String.prototype.toUpperCase,
          generated.INTRINSICS_String_prototype_toUpperCase,
        ],
        [
          String.prototype.toLowerCase,
          generated.INTRINSICS_String_prototype_toLowerCase,
        ],
        [
          String.prototype.toString,
          generated.INTRINSICS_String_prototype_toString,
        ],
        [
          String.prototype.toWellFormed,
          generated.INTRINSICS_String_prototype_toWellFormed,
        ],
        [String.prototype.trim, generated.INTRINSICS_String_prototype_trim],
        [
          String.prototype.trimEnd,
          generated.INTRINSICS_String_prototype_trimEnd,
        ],
        [
          String.prototype.trimStart,
          generated.INTRINSICS_String_prototype_trimStart,
        ],
        [
          String.prototype.valueOf,
          generated.INTRINSICS_String_prototype_valueOf,
        ],

        // Annex B HTML wrapper methods.
        [String.prototype.anchor, generated.INTRINSICS_String_prototype_anchor],
        [String.prototype.big, generated.INTRINSICS_String_prototype_big],
        [String.prototype.blink, generated.INTRINSICS_String_prototype_blink],
        [String.prototype.bold, generated.INTRINSICS_String_prototype_bold],
        [String.prototype.fixed, generated.INTRINSICS_String_prototype_fixed],
        [
          String.prototype.fontcolor,
          generated.INTRINSICS_String_prototype_fontcolor,
        ],
        [
          String.prototype.fontsize,
          generated.INTRINSICS_String_prototype_fontsize,
        ],
        [
          String.prototype.italics,
          generated.INTRINSICS_String_prototype_italics,
        ],
        [String.prototype.link, generated.INTRINSICS_String_prototype_link],
        [String.prototype.small, generated.INTRINSICS_String_prototype_small],
        [String.prototype.strike, generated.INTRINSICS_String_prototype_strike],
        [String.prototype.sub, generated.INTRINSICS_String_prototype_sub],
        [String.prototype.sup, generated.INTRINSICS_String_prototype_sup],

        // Regex methods — substituted by the symbolic regex seam ($.regexOp). match
        // and search are kept out of copy-polyfill's esmeta extraction (EXCLUDE), so
        // these manual models are their only registration.
        [RegExp.prototype.test, generated.INTRINSICS_RegExp_prototype_test],
        [RegExp.prototype.exec, generated.INTRINSICS_RegExp_prototype_exec],
        [String.prototype.match, generated.INTRINSICS_String_prototype_match],
        [
          String.prototype.matchAll,
          generated.INTRINSICS_String_prototype_matchAll,
        ],
        [String.prototype.search, generated.INTRINSICS_String_prototype_search],

        [Array.prototype.at, generated.INTRINSICS_Array_prototype_at],
        [Array.prototype.concat, generated.INTRINSICS_Array_prototype_concat],
        [
          Array.prototype.copyWithin,
          generated.INTRINSICS_Array_prototype_copyWithin,
        ],
        [Array.prototype.fill, generated.INTRINSICS_Array_prototype_fill],
        [Array.prototype.filter, generated.INTRINSICS_Array_prototype_filter],
        [Array.prototype.find, generated.INTRINSICS_Array_prototype_find],
        [
          Array.prototype.findIndex,
          generated.INTRINSICS_Array_prototype_findIndex,
        ],
        [
          Array.prototype.findLast,
          generated.INTRINSICS_Array_prototype_findLast,
        ],
        [
          Array.prototype.findLastIndex,
          generated.INTRINSICS_Array_prototype_findLastIndex,
        ],
        [Array.prototype.join, generated.INTRINSICS_Array_prototype_join],
        [Array.prototype.map, generated.INTRINSICS_Array_prototype_map],
        [Array.prototype.pop, generated.INTRINSICS_Array_prototype_pop],
        [Array.prototype.push, generated.INTRINSICS_Array_prototype_push],
        [Array.prototype.reduce, generated.INTRINSICS_Array_prototype_reduce],
        [
          Array.prototype.reduceRight,
          generated.INTRINSICS_Array_prototype_reduceRight,
        ],
        [Array.prototype.shift, generated.INTRINSICS_Array_prototype_shift],
        [Array.prototype.slice, generated.INTRINSICS_Array_prototype_slice],

        [Math.floor, generated.INTRINSICS_Math_floor],
        [Math.ceil, generated.INTRINSICS_Math_ceil],
        [Math.round, generated.INTRINSICS_Math_round],
        [Math.abs, generated.INTRINSICS_Math_abs],
        [Math.trunc, generated.INTRINSICS_Math_trunc],
        [Math.sign, generated.INTRINSICS_Math_sign],
        // Math.max/min polyfills are generated but left unregistered (concretized, as
        // ExpoSE does — it has no max/min model either). Their spec fold seeds with
        // ±Infinity ($.lit), which the concolic Real-SMT backend can't encode
        // (`non-finite number: Infinity`, smt.ts) → registering errors on any
        // symbolically-compared operand. Re-enable once smt.ts folds ±∞ comparisons.
        // [Math.max, generated.INTRINSICS_Math_max],
        // [Math.min, generated.INTRINSICS_Math_min],

        [JSON.stringify, generated.INTRINSICS_JSON_stringify],
      ] as [Function | undefined, Function][]
    ).filter((entry): entry is [Function, Function] => entry[0] !== undefined),
  );

  static SYNTAX = new Map<string, Function>([['+', generated.SYNTAX__add]]);

  static support(f: Function): boolean {
    return this.BUILTINS.has(f);
  }

  /** @deprecated */
  static supportSyntax(op: string): boolean {
    return this.SYNTAX.has(op);
  }

  constructor(public $: SpecRuntime) {}

  static ofBuiltin(f: Function): Function {
    const polyfill = Model.BUILTINS.get(f);
    if (polyfill === undefined) {
      throw new Error(`Unsupported built-in function: ${f.name}`);
    }
    return polyfill;
  }

  /** @deprecated */
  static ofSyntax(op: string): Function {
    const polyfill = Model.SYNTAX.get(op);
    if (polyfill === undefined) {
      throw new Error(`Unsupported syntax operator: ${op}`);
    }
    return polyfill;
  }
}
