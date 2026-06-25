// @type concolic
// @target es5 Array.prototype.shift
// @feature builtin shift

function __test_symbolic__(symbolic) {
    var f = symbolic.shift();
    // @witness __test_symbolic__([7, 2])
    __IS_SAT__(f === 7, true);
}

__test_symbolic__(__symbolic__('s', [1, 2]));
