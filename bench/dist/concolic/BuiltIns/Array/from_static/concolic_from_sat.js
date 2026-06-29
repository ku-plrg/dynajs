// @type concolic
// @target es6+ Array.from
// @feature builtin from

function __test_symbolic__(symbolic) {

    // @witness __test_symbolic__([8])
    __IS_SAT__(Array.from(symbolic) === [8], true);

}

__test_symbolic__(__symbolic__('s', [3]));
