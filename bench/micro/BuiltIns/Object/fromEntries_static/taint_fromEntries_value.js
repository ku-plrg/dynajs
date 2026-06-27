// @type taint
// @target es6+ Object.fromEntries
// @feature builtin fromEntries

function __test_taint__(tainted) {
    var r = Object.fromEntries([['k', tainted]]);
    // @witness __test_taint__('x') => r.k = 'x' tainted
    __assert_taint__(r.k, true);

    // @witness always r.k = 'c', clean
    __assert_taint__(Object.fromEntries([['k', 'c']]).k, false);
}

__test_taint__(__set_taint__('hello'));
