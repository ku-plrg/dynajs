// @type taint
// @target es5 arithmetic
// @feature syntax arithmetic
// @done

function __test_taint__(tainted) {
    // @witness __test_taint__(42) => tainted % 43 = 42 tainted
    __assert_taint__(tainted % 43, true);
}

__test_taint__(__set_taint__(10));
