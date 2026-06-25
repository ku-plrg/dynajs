// @type concolic
// @target es6+ Array.prototype.keys
// @feature builtin keys
// @done

function __test_symbolic__(symbolic) {

    // @witness __test_symbolic__([1, 2, 3])
    __IS_SAT__([...symbolic.keys()].length === 3, true);

}

__test_symbolic__(__symbolic__('s', [1, 2]));
