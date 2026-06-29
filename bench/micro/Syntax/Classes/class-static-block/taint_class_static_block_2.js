// @type taint
// @target es6+ class-static-block
// @feature syntax class-static-block
// @done

function __test_taint__(tainted) {
    class TSB {
      static data;
      static label = "clean";
      static {
        TSB.data = tainted;
      }
    }
    // @witness always "clean"
    __assert_taint__(TSB.label, false);
}

__test_taint__(__set_taint__("tv"));
