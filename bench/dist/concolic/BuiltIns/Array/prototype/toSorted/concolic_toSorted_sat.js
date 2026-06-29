// @type concolic
// @target es6+ Array.prototype.toSorted
// @feature builtin toSorted

function __test_symbolic__(symbolic) {

    // @witness __test_symbolic__([5, 5])
    __IS_SAT__(symbolic.toSorted(function (a, b) { return a - b; }) === [5, 5], true);

}

__test_symbolic__(__symbolic__('s', [2, 1]));
