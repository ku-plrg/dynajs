// @type concolic
// @target es6+ Array.prototype.flat
// @feature builtin flat
// @done

function __test_symbolic__(symbolic) {

    // @witness __test_symbolic__([7, 0])
    __IS_SAT__(symbolic.flat() === [7, 0], true);

}

__test_symbolic__(__symbolic__('s', [1, 2]));
