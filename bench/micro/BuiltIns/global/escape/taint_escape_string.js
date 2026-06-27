// @type taint
// @target es5 escape
// @feature builtin escape

function __test_taint__(tainted) {
    var r = escape(tainted);

    // @witness __test_taint__('xx') => r[0] = 'x' tainted
    __assert_taint__(r[0], true);

    // @witness __test_taint__('xx') => r[1] = 'x' tainted
    __assert_taint__(r[1], true);
}

__test_taint__(__set_taint__('ab'));
