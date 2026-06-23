// @type taint
// @target es6 Object.is
// @feature builtin is

function __test_taint__(tainted) {
    // @witness Object.is returns boolean; tainted args produce no tainted boolean
    __assert_taint__(Object.is(tainted, tainted), false);
    __assert_taint__(Object.is(tainted, 'other'), false);
}

__test_taint__(__set_taint__('hello'));
