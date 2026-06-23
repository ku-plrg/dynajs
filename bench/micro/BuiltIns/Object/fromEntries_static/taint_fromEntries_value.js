// @type taint
// @target es6+ Object.fromEntries
// @feature builtin fromEntries

function __test_taint__(tainted) {
    var r = Object.fromEntries([['k', tainted]]);
    // @witness __test_taint__('hello') => r.k='hello' (tainted value)
    __assert_taint__(r.k, true);

    // @witness always Object.fromEntries([['k','c']]).k='c' (clean value)
    __assert_taint__(Object.fromEntries([['k', 'c']]).k, false);
}

__test_taint__(__set_taint__('hello'));
