// @type concolic
// @target es5 Function.prototype.apply
// @feature builtin apply

function __test_symbolic__(symbolic) {
    if (symbolic.indexOf(7) >= 0) {
        var s = Math.max.apply(null, symbolic);
        // @witness the indexOf(7) guard puts 7 in the array, so its max is never below 7
        __IS_SAT__(s < 7, false);
    } else {
        __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', [7]));
