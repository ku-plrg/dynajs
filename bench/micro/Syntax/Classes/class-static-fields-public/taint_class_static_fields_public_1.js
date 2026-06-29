// @type taint
// @target es6+ class-static-fields-public
// @feature syntax class-static-fields-public

function __test_taint__(tainted) {
    class C {
      static pub = tainted;
    }
    // @witness __test_taint__('x') => public static field = 'x' tainted
    __assert_taint__(C.pub, true);
}

__test_taint__(__set_taint__("tv"));
