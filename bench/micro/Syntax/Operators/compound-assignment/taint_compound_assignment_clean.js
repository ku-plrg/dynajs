// @type taint
// @target es5 compound-assignment
// @feature syntax compound-assignment

function __test_taint__(tainted) {
    var tc_clean = "a";
    tc_clean += "b";
    __assert_taint__(tc_clean, false);
}

__test_taint__(__set_taint__("x"));
