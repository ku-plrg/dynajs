// @type concolic
// @target es5 Array.prototype.reverse
// @feature builtin reverse
// @done

function __test_symbolic__(symbolic) {
    symbolic.reverse();
    // @witness __test_symbolic__([1, 9])
    __IS_SAT__(symbolic[0] === 9, true);
}

__test_symbolic__(__symbolic__('s', [1, 2]));
