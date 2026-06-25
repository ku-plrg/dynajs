// @type concolic
// @target es5 Array.prototype.slice
// @feature builtin slice
// @done

function __test_symbolic__(symbolic) {

    // @witness __test_symbolic__([7, 9])
    __IS_SAT__(symbolic.slice(1) === [9], true);

}

__test_symbolic__(__symbolic__('s', [7, 8]));
