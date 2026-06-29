// @type taint
// @target es6+ spread-clone
// @feature syntax spread-clone
// @done

function __test_taint__(tainted) {
    var tsc_arr = [tainted];
    var tsc_arr_copy = [...tsc_arr];
        var tsc_clean = [{ p: "a" }];
    var tsc_clean_copy = [...tsc_clean];
    var tsc_obj = { p: tainted };
    var tsc_obj_copy = { ...tsc_obj };
    // @witness __test_taint__('x') -> tsc_obj_copy.p = 'x'
    __assert_taint__(tsc_obj_copy.p, true);
}

__test_taint__(__set_taint__("tv"));
