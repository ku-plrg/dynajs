// @type taint
// @target es5 arithmetic
// @feature syntax arithmetic
// @done

function __test_taint__(tainted) {
    // @witness __test_taint__(21) => tainted * 2 = 42 tainted
    __assert_taint__(tainted * 2, true);
}

__test_taint__(__set_taint__(5));
