// @type taint
// @target es6+ Object.assign
// @feature builtin assign

function __test_taint__(tainted) {
    var r = Object.assign({}, {p: tainted});
    // @witness __test_taint__('x') => r.p = 'x' tainted
    __assert_taint__(r.p, true);

    // @witness always r.p = 'c', clean
    __assert_taint__(Object.assign({}, {p: 'c'}).p, false);
}

__test_taint__(__set_taint__('hello'));
