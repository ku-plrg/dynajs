/**
 * CompareSome — emits a depth-indented trace of analysis events, designed to be
 * run under BOTH DynaJS and Jalangi so their event streams can be diffed.
 *
 * The trace logic is written once as a DynaJS `Analysis` (`analysis`, below,
 * type-checked). Under DynaJS it is installed directly; under Jalangi (where
 * `D$` is absent and the runtime injects `J$`) `installOnJalangi` adapts the
 * hooks whose Jalangi calling convention differs from DynaJS's. `J$` is the only
 * cross-runtime, untyped surface and is confined to that adapter.
 */
(function () {
  let level = 0;

  /** @param {unknown} val */
  function specToString(val) {
    if (typeof val === 'symbol') {
      return val.toString();
    }
    return String(new String(val));
  }

  /** @param {unknown} prop */
  function propLabel(prop) {
    return typeof prop === 'object' || typeof prop === 'function'
      ? '<side effect>'
      : specToString(prop);
  }

  /** @param {unknown} val */
  function stringify(val) {
    console.log(JSON.stringify(val));
  }

  /** @type {import('../src/types/analysis.js').Analysis} */
  const analysis = {
    invokeFunPre: function (iid, f, base, args, isConstructor, isMethod) {
      var fname = typeof f === 'function' ? f.name : '<not callable>';
      stringify({ type: 'invokeFunPre', f: fname, level: level });
      ++level;
      return { f: f, base: base, args: args, skip: false };
    },

    invokeFun: function (iid, f, base, args, result, isConstructor, isMethod) {
      var fname = typeof f === 'function' ? f.name : '<not callable>';
      stringify({ type: 'invokeFun', f: fname, level: level });
      --level;
      return { result: result };
    },

    literal: function (iid, val) {
      stringify({ type: 'literal', valueType: typeof val, level: level });
      return { result: val };
    },

    forInOfObject: function (iid, val, isForIn) {
      stringify({ type: 'forinObject', obj: 'todo', level: level });
      return { result: val };
    },

    declare: function (id, name, kind, init, value) {
      stringify({ type: 'declare', name: name, level: level });
    },

    getFieldPre: function (iid, base, prop) {
      stringify({ type: 'getFieldPre', prop: propLabel(prop), level: level });
      ++level;
      return { base: base, prop: prop, skip: false };
    },

    getField: function (iid, base, prop, result) {
      stringify({ type: 'getField', prop: propLabel(prop), level: level });
      --level;
      return { result };
    },

    putFieldPre: function (iid, base, prop, value) {
      stringify({ type: 'putFieldPre', prop: propLabel(prop), level: level });
      ++level;
      return { base, prop, value, skip: false };
    },

    putField: function (iid, base, prop, value) {
      stringify({ type: 'putField', prop: propLabel(prop), level: level });
      --level;
      return { result: value };
    },

    read: function (iid, name, val) {
      stringify({ type: 'read', name: name, level: level });
      return { result: val };
    },

    write: function (iid, names, val) {
      stringify({ type: 'write', name: names[0], level: level });
      return { result: val };
    },

    functionEnter: function (iid, f, base, args, isAsync, isGenerator) {
      stringify({ type: 'functionEnter', fo: '', level: level });
      ++level;
    },

    functionExit: function (iid, returnVal, wrappedExceptionVal, isAsync, isGenerator) {
      stringify({ type: 'functionExit', fo: 'todo', level: level });
      --level;
    },

    binaryPre: function (iid, op, left, right) {
      stringify({ type: 'binaryPre', op, level: level });
      ++level;
      return { op: op, left: left, right: right, skip: false };
    },

    binary: function (iid, op, left, right, result) {
      stringify({ type: 'binary', op, level: level });
      --level;
      return { result: result };
    },

    unaryPre: function (iid, op, prefix, operand) {
      stringify({ type: 'unaryPre', op, level: level });
      ++level;
      return { op: op, operand: operand, skip: false };
    },

    unary: function (iid, op, prefix, operand, result) {
      stringify({ type: 'unary', op, level: level });
      --level;
      return { result: result };
    },
  };

  if (typeof D$ !== 'undefined') {
    D$.analysis = analysis;
  } else {
    installOnJalangi(analysis);
  }

  /**
   * Drive the Jalangi global `J$` (injected by the Jalangi runtime) with the
   * typed analysis. Most hooks share DynaJS's parameter positions and are reused
   * verbatim; the few whose Jalangi convention differs are overridden here. This
   * is the only place that touches `J$`, which has no type in this project.
   *
   * @param {import('../src/types/analysis.js').Analysis} a
   */
  function installOnJalangi(a) {
    /** @type {Record<string, Function>} */
    const hooks = Object.assign({}, /** @type {Record<string, Function>} */ (a));

    // Jalangi passes the written name as a string; DynaJS as an array.
    /** @param {number} iid @param {string} name @param {unknown} val */
    hooks.write = function (iid, name, val) {
      stringify({ type: 'write', name: name, level: level });
      return { result: val };
    };

    // Jalangi's for-in hook is named `forinObject` and takes (iid, val).
    /** @param {number} iid @param {unknown} val */
    hooks.forinObject = function (iid, val) {
      stringify({ type: 'forinObject', obj: 'todo', level: level });
      return { result: val };
    };

    // Jalangi adds (isOpAssign, isSwitchCaseComparison, isComputed, isThrown);
    // re-emit `binary` with the Jalangi-only `isThrown` field for trace parity.
    /**
     * @param {number} iid @param {string} op @param {unknown} left
     * @param {unknown} right @param {unknown} result @param {boolean} [isOpAssign]
     * @param {boolean} [isSwitchCaseComparison] @param {boolean} [isComputed]
     * @param {boolean} [isThrown]
     */
    hooks.binary = function (iid, op, left, right, result, isOpAssign, isSwitchCaseComparison, isComputed, isThrown) {
      stringify({ type: 'binary', op, level: level, isThrown: isThrown });
      --level;
      return { result: result };
    };

    // @ts-ignore - `J$` is injected by the Jalangi runtime; it has no type here.
    J$.analysis = hooks;
  }
})();
