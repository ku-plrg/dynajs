// @type taint
// @target es6+ spread-clone
// @feature syntax spread-clone

function __test_taint__(tainted) {
    var tsc_arr = [tainted];
    var tsc_arr_copy = [...tsc_arr];
    __assert_taint__(tsc_arr_copy[0], true);
}

__test_taint__(__set_taint__("tv"));
