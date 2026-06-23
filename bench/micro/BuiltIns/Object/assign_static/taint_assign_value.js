// @type taint
// @target es6+ Object.assign
// @feature builtin assign

function __test_taint__(tainted) {
    var r = Object.assign({}, {p: tainted});
    // @witness __test_taint__('hello') => r.p='hello' (tainted value copied)
    __assert_taint__(r.p, true);

    // @witness always Object.assign({},{p:'c'}).p='c' (clean value)
    __assert_taint__(Object.assign({}, {p: 'c'}).p, false);
}

__test_taint__(__set_taint__('hello'));
