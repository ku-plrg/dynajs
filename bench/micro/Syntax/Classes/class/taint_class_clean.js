// @type taint
// @target es6+ class
// @feature syntax class

function __test_taint__(tainted) {
    class TCL_E {
      constructor() {
        this.label = "fixed";
      }
    }
    __assert_taint__(new TCL_E().label, false);
}

__test_taint__(__set_taint__("x"));
