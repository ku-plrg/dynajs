// @type concolic
// @target es5 Array.prototype.lastIndexOf
// @feature builtin lastindexof
// @done

function __test_symbolic__(symbolic) {

    // @witness __test_symbolic__([0, 7])
    __IS_SAT__(symbolic.lastIndexOf(7) === 1, true);

}

__test_symbolic__(__symbolic__('s', [1, 2]));
