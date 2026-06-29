// @type taint
// @target es5 compound-assignment
// @feature syntax compound-assignment

function __test_taint__(tainted) {
    var tc_num = 1;
    tc_num += tainted;
    // @witness __test_taint__(41) => tc_num = 1 + 41 = 42 tainted
    __assert_taint__(tc_num, true);
}

__test_taint__(__set_taint__(5));
