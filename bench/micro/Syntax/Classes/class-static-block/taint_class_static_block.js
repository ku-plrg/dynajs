// @type taint
// @target es6+ class-static-block
// @feature syntax class-static-block

function __test_taint__(tainted) {
    class TSB {
      static data;
      static label = "fixed";
      static {
        TSB.data = tainted;
      }
    }
    __assert_taint__(TSB.data, true);
    __assert_taint__(TSB.label, false);
}

__test_taint__(__set_taint__("tv"));
