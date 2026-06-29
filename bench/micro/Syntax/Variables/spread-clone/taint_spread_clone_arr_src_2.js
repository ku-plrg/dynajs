// @type taint
// @target es6+ spread-clone
// @feature syntax spread-clone
// @done

function __test_taint__(tainted) {
    var tsc_arr = [tainted];
    var tsc_arr_copy = [...tsc_arr];
        var tsc_clean = [{ p: "a" }];
    var tsc_clean_copy = [...tsc_clean];
    // @witness tsc_clean_copy[0].p is always "a"
    __assert_taint__(tsc_clean_copy[0].p, false);
}

__test_taint__(__set_taint__("tv"));
