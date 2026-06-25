// @type concolic
// @target es5 Array.prototype.toLocaleString
// @feature builtin toLocaleString
// @done

function __test_symbolic__(symbolic) {

    // @witness __test_symbolic__([7, 0])
    __IS_SAT__(symbolic.toLocaleString().includes("7"), true);

}

__test_symbolic__(__symbolic__('s', [1, 2]));
