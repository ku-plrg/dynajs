// @type taint
// @target es5 Function.constructor
// @feature builtin Function

function __test_taint__(tainted) {
    var fn = new Function('a', 'return a');

    // @witness __test_taint__('hello') => fn(tainted)='hello' (data flows through call)
    __assert_taint__(fn(tainted), true);

    // @witness clean arg => fn('c')='c' (not tainted)
    __assert_taint__(fn('c'), false);
}

__test_taint__(__set_taint__('hello'));
