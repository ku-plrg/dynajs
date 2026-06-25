// @type concolic
// @target es6+ Array.prototype.findLastIndex
// @feature builtin findLastIndex

function __test_symbolic__(symbolic) {

    // @witness __test_symbolic__([0, 20])
    __IS_SAT__(symbolic.findLastIndex(function (v) { return v > 10; }) === 1, true);

}

__test_symbolic__(__symbolic__('s', [1, 2]));
