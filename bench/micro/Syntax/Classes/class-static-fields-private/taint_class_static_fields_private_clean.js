// @type taint
// @target es6+ class-static-fields-private
// @feature syntax class-static-fields-private
// Private static fields (`static #x`, ES2022) belong to the class itself. A
// parser without private-field support reports `error` here; ground truth is the
// true semantics.

function __test_taint__(tainted) {
    class TSF2 {
      static #s = "fixed";
      static read() {
        return TSF2.#s;
      }
    }
    __assert_taint__(TSF2.read(), false);
}

__test_taint__(__set_taint__("x"));
