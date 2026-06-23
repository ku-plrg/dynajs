// @type taint
// @target es6+ Number.parseFloat
// @feature builtin parseFloat

function __test_taint__(tainted) {
    var r = Number.parseFloat(tainted);

    // @witness __test_taint__('3.5') => r = 3.5 tainted
    __assert_taint__(r, true);
}

__test_taint__(__set_taint__('3.5'));
