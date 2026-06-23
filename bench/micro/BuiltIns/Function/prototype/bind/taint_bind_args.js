// @type taint
// @target es5 Function.prototype.bind
// @feature builtin bind

function __test_taint__(tainted) {
    var id = function(x) { return x; };

    // @witness __test_taint__('hello') => id.bind(null, tainted)() = 'hello' tainted
    __assert_taint__(id.bind(null, tainted)(), true);

    // @witness clean literal arg 'c', not tainted
    __assert_taint__(id.bind(null, 'c')(), false);
}

__test_taint__(__set_taint__('hello'));
