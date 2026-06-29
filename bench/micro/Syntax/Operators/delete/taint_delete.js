// @type taint
// @target es5 delete
// @feature syntax delete

function __test_taint__(tainted) {
    var del_o = { k: tainted };
    var del_r = delete del_o.k;
    // @witness boolean result, clean
    __assert_taint__(del_r, false);
}

__test_taint__(__set_taint__("tv"));
