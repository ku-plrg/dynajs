// @type taint
// @target es6+ class-static-methods-private
// @feature syntax class-static-methods-private
// @done

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
    // @witness __test_taint__("x")
    __assert_taint__(TSM.run(tainted), true);
}

__test_taint__(__set_taint__("tv"));
