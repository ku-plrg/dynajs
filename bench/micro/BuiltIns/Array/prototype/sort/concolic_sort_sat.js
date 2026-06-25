// @type concolic
// @target es5 Array.prototype.sort
// @feature builtin sort

function __test_symbolic__(symbolic) {
    symbolic.sort(function (a, b) { return a - b; });
    // @witness __test_symbolic__([5, 5])
    __IS_SAT__(symbolic[0] === symbolic[1], true);
}

__test_symbolic__(__symbolic__('s', [2, 1]));
