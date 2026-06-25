// @type concolic
// @target es6+ Array.prototype.toReversed
// @feature builtin toReversed

function __test_symbolic__(symbolic) {

    // @witness __test_symbolic__([1, 9])
    __IS_SAT__(symbolic.toReversed() === [9, 1], true);

}

__test_symbolic__(__symbolic__('s', [1, 2]));
