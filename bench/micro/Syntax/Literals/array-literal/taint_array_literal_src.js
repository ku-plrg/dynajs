// @type taint
// @target es5 array-literal
// @feature syntax array-literal

function __test_taint__(tainted) {
    var tal_arr = [tainted, "clean"];
    // @witness __test_taint__('x') => tal_arr[0] = 'x' tainted
    __assert_taint__(tal_arr[0], true);
    // @witness clean literal "clean" placed at index 1, taint not propagated => clean
    __assert_taint__(tal_arr[1], false);
}

__test_taint__(__set_taint__("tv"));
