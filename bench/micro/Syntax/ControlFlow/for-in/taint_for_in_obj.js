// @type taint
// @target es5 for-in
// @feature syntax for-in
// @done

function __test_taint__(tainted) {
    var ti_obj = { k: tainted };
    var ti_val;
    for (var ti_key in ti_obj) {
      ti_val = ti_obj[ti_key];
    }
    // @witness __test_taint__("x")
    __assert_taint__(ti_val, true);
}

__test_taint__(__set_taint__("tv"));
