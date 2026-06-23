// @type taint
// @target es5 array-literal
// @feature syntax array-literal

function __test_taint__(tainted) {
    var tal_arr = [tainted, "clean"];
    __assert_taint__(tal_arr[0], true);
    __assert_taint__(tal_arr[1], false);
}

__test_taint__(__set_taint__("tv"));
