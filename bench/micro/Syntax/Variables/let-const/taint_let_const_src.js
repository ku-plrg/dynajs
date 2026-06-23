// @type taint
// @target es6+ let-const
// @feature syntax let-const

function __test_taint__(tainted) {
    const tlc_copy = tainted;
    __assert_taint__(tlc_copy, true);
}

__test_taint__(__set_taint__("tv"));
