// @type taint
// @target es5 array-literal
// @feature syntax array-literal
// @done

function __test_taint__(tainted) {
    var tal_arr = [tainted, "clean"];
    // @witness __test_taint__('x') => tal_arr[0] = 'x' tainted
    __assert_taint__(tal_arr[0], true);
}

__test_taint__(__set_taint__("tv"));
