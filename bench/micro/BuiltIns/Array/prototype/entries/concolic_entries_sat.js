// @type concolic
// @target es6+ Array.prototype.entries
// @feature builtin entries
// @done

function __test_symbolic__(symbolic) {

    // @witness __test_symbolic__([9])
    __IS_SAT__(symbolic.entries().next().value[1] === 9, true);

}

__test_symbolic__(__symbolic__('s', [3]));
