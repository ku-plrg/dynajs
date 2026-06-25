// @type concolic
// @target es5 Array.prototype.some
// @feature builtin some

function __test_symbolic__(symbolic) {

    // @witness __test_symbolic__([9, 0])
    __IS_SAT__(symbolic.some(function (v) { return v > 5; }), true);

}

__test_symbolic__(__symbolic__('s', [1, 2]));
