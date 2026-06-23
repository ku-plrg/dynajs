// @type concolic
// @target es5 Function.prototype.apply
// @feature builtin apply

function __test_symbolic__(symbolic) {
    if (symbolic.indexOf(7) >= 0) {
        var s = Math.max.apply(null, symbolic);
        // @witness __test_symbolic__([7, 99])
        __IS_SAT__(s > 7, true);
    }
}

__test_symbolic__(__symbolic__('s', [7]));
