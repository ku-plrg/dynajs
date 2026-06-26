// @type concolic
// @target es6+ Array.prototype.values
// @feature builtin values
// @done

function __test_symbolic__(symbolic) {

    // @witness __test_symbolic__([9])
    __IS_SAT__(symbolic.values().next().value === 9, true);

}

__test_symbolic__(__symbolic__('s', [3]));
