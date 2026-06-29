// @type taint
// @target es5 array-literal
// @feature syntax array-literal
// @done

function __test_taint__(tainted) {
    var tal_nested = [["a", tainted]];
    // @witness __test_taint__('x') => tal_nested[0][1] = 'x' tainted
    __assert_taint__(tal_nested[0][1], true);
}

__test_taint__(__set_taint__("tv"));
