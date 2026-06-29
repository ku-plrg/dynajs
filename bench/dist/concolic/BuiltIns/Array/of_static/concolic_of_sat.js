// @type concolic
// @target es6+ Array.of
// @feature builtin of

function __test_symbolic__(symbolic) {

    // @witness __test_symbolic__([5])
    __IS_SAT__(Array.of(symbolic[0], 9) === [5, 9], true);

}

__test_symbolic__(__symbolic__('s', [3]));
