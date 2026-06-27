// @type taint
// @target es5 Function.constructor
// @feature builtin Function
// @done

function __test_taint__(tainted) {
    var fn = new Function('a', 'return a');

    // @witness __test_taint__('x') => fn(tainted) = 'x' tainted
    __assert_taint__(fn(tainted), true);

    // @witness clean literal arg 'c', not tainted
    __assert_taint__(fn('c'), false);
}

__test_taint__(__set_taint__('hello'));
