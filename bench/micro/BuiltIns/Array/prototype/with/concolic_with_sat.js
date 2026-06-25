// @type concolic
// @target es6+ Array.prototype.with
// @feature builtin with

function __test_symbolic__(symbolic) {

    // @witness __test_symbolic__([1, 9])
    __IS_SAT__(symbolic.with(0, 5) === [5, 9], true);

}

__test_symbolic__(__symbolic__('s', [1, 2]));
