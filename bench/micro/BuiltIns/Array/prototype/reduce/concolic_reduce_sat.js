// @type concolic
// @target es5 Array.prototype.reduce
// @feature builtin reduce

function __test_symbolic__(symbolic) {

    // @witness __test_symbolic__([4, 6])
    __IS_SAT__(symbolic.reduce(function (a, v) { return a + v; }, 0) === 10, true);

}

__test_symbolic__(__symbolic__('s', [1, 2]));
