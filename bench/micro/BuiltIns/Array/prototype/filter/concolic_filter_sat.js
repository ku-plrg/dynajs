// @type concolic
// @target es5 Array.prototype.filter
// @feature builtin filter
// @done

function __test_symbolic__(symbolic) {

    // @witness __test_symbolic__([5, 6])
    __IS_SAT__(symbolic.filter(function (v) { return v > 0; }).length === 2, true);

}

__test_symbolic__(__symbolic__('s', [5]));
