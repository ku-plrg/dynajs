// @type concolic
// @target es6+ Array.prototype.flatMap
// @feature builtin flatMap

function __test_symbolic__(symbolic) {

    // @witness __test_symbolic__([9, 0])
    __IS_SAT__(symbolic.flatMap(function (v) { return [v]; }) === [9, 0], true);

}

__test_symbolic__(__symbolic__('s', [1, 2]));
