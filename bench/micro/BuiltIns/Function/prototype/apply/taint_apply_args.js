// @type taint
// @target es5 Function.prototype.apply
// @feature builtin apply
// @done

function __test_taint__(tainted) {
    var id = function(x) { return x; };

    // @witness __test_taint__('x') => id.apply(null, [tainted]) = 'x' tainted
    __assert_taint__(id.apply(null, [tainted]), true);

    // @witness clean literal arg 'c', not tainted
    __assert_taint__(id.apply(null, ['c']), false);
}

__test_taint__(__set_taint__('hello'));
