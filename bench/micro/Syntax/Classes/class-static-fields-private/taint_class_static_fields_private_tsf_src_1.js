// @type taint
// @target es6+ class-static-fields-private
// @feature syntax class-static-fields-private
// @done

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
}

__test_taint__(__set_taint__("tv"));
