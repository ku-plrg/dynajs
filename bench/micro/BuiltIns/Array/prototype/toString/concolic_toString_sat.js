// @type concolic
// @target es5 Array.prototype.toString
// @feature builtin toString

function __test_symbolic__(symbolic) {

    // @witness __test_symbolic__([7, 0])
    __IS_SAT__(symbolic.toString().includes("7"), true);

}

__test_symbolic__(__symbolic__('s', [1, 2]));
