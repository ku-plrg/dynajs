// @type concolic
// @target es5 Array.prototype.push
// @feature builtin push

function __test_symbolic__(symbolic) {
    if (symbolic.length === 1) {
        symbolic.push(42);
        // @witness __test_symbolic__([5])
        __IS_SAT__(symbolic.indexOf(99) === -1, true);
    }
}

__test_symbolic__(__symbolic__('s', [7]));
