// @type taint
// @target es6+ let-const
// @feature syntax let-const

function __test_taint__(tainted) {
    const tlc_y = "plain";
    __assert_taint__(tlc_y, false);
}

__test_taint__(__set_taint__("tv"));
