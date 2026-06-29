// @type taint
// @target es6+ class-static-fields-public
// @feature syntax class-static-fields-public

function __test_taint__(tainted) {
    class C {
      static pub = tainted;
    }

    class D {
      static pub = "clean";
    }
    // @witness clean literal static field => clean
    __assert_taint__(D.pub, false);
}

__test_taint__(__set_taint__("tv"));
