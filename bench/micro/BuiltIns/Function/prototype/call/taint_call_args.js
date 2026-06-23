// @type taint
// @target es5 Function.prototype.call
// @feature builtin call

function __test_taint__(tainted) {
    var id = function(x) { return x; };

    // @witness __test_taint__('hello') => id.call(null,tainted)='hello'
    __assert_taint__(id.call(null, tainted), true);

    // @witness clean arg => id.call(null,'c')='c' (not tainted)
    __assert_taint__(id.call(null, 'c'), false);
}

__test_taint__(__set_taint__('hello'));
