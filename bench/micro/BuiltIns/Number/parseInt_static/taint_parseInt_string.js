// @type taint
// @target es6+ Number.parseInt
// @feature builtin parseInt

function __test_taint__(tainted) {
    var r = Number.parseInt(tainted);

    // @witness __test_taint__('34') => r = 34 tainted
    __assert_taint__(r, true);
}

__test_taint__(__set_taint__('34'));
