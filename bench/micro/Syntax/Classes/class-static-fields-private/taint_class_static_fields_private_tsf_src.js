// @type taint
// @target es6+ class-static-fields-private
// @feature syntax class-static-fields-private
// Private static fields (`static #x`, ES2022) belong to the class itself. A
// parser without private-field support reports `error` here; ground truth is the
// true semantics.

function __test_taint__(tainted) {
    class TSF {
      static #s = tainted;
      static #label = "clean";
      static read() {
        return TSF.#s;
      }
      static getLabel() {
        return TSF.#label;
      }
    }
    // @witness __test_taint__("x")
    __assert_taint__(TSF.read(), true);
    // @witness always "clean"
    __assert_taint__(TSF.getLabel(), false);
}

__test_taint__(__set_taint__("tv"));
