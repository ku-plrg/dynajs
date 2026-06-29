// @type taint
// @target es5 arithmetic
// @feature syntax arithmetic
// @done

function __test_taint__(tainted) {
    // @witness __test_taint__(43) => 42 % tainted = 42 tainteds
    __assert_taint__(42 % tainted, true);
}

__test_taint__(__set_taint__(10));
