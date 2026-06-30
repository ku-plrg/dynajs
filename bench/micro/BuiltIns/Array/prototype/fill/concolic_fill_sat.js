// @type concolic
// @target es6+ Array.prototype.fill
// @feature builtin fill
// @done

function __test_symbolic__(symbolic) {

    symbolic.fill(9, 1, 3);
    // @witness __test_symbolic__([9, 1, 2, 3])
    __IS_SAT__(symbolic[0] === 9, true);
    
}

__test_symbolic__(__symbolic__('s', [0, 1, 2, 3]));
