// @type taint
// @target es6+ class
// @feature syntax class
// @done

function __test_taint__(tainted) {
    class TCL_E {
      constructor() {
        this.taint = tainted;
        this.label = "clean";
      }
    }
    // @witness always "clean"
    __assert_taint__(new TCL_E().label, false);
}

__test_taint__(__set_taint__("x"));
