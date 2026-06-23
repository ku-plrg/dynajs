// @type taint
// @target es6+ class-static-methods-private
// @feature syntax class-static-methods-private
// Private static methods (`static #m(){}`, ES2022) are callable only from within
// the class. A parser without private-method support reports `error` here;
// ground truth is the true semantics.

class TSM {
  static #passthru(v) {
    return v;
  }
  static run(x) {
    return TSM.#passthru(x);
  }
}

class TSM2 {
  static #constant() {
    return "fixed";
  }
  static run(x) {
    return TSM2.#constant();
  }
}

function __test_taint__(tainted) {
    __assert_taint__(TSM.run(tainted), true);
    __assert_taint__(TSM2.run(tainted), false);
}

__test_taint__(__set_taint__("tv"));
