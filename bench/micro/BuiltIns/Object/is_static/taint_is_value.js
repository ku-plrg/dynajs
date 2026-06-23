// @type taint
// @target es6+ Object.is
// @feature builtin is

function __test_taint__(tainted) {
    // @witness boolean result, clean
    __assert_taint__(Object.is(tainted, tainted), false);
    // @witness boolean result, clean
    __assert_taint__(Object.is(tainted, 'other'), false);
}

__test_taint__(__set_taint__('hello'));
