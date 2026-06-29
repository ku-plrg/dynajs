// @type taint
// @target es6+ spread-clone
// @feature syntax spread-clone
// @done

function __test_taint__(tainted) {
    var tsc_arr = [tainted];
    var tsc_arr_copy = [...tsc_arr];
    // @witness __test_taint__('x') -> tsc_arr_copy[0] = 'x'
    __assert_taint__(tsc_arr_copy[0], true);
}

__test_taint__(__set_taint__("tv"));
