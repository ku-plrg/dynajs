// @type taint
// @target es5 compound-assignment
// @feature syntax compound-assignment

function __test_taint__(tainted) {
    var tc_cat = "pre";
    tc_cat += tainted;
    // @witness __test_taint__('x') => tc_cat = 'prex' tainted
    __assert_taint__(tc_cat, true);
}

__test_taint__(__set_taint__("tv"));
