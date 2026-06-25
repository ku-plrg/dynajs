// @type concolic
// @target es5 Array.prototype.map
// @feature builtin map
// @done

function __test_symbolic__(symbolic) {

    // @witness __test_symbolic__([4, 0])
    __IS_SAT__(symbolic.map(function (v) { return v + 1; }) === [5, 1], true);

}

__test_symbolic__(__symbolic__('s', [1, 2]));
