// @type concolic
// @target es5 Function.prototype.call
// @feature builtin call

function __test_symbolic__(symbolic) {
    function double(x) {
        return x * 2;
    }
    if (symbolic > 5) {
        var r = double.call(null, symbolic);
        // @witness __test_symbolic__(6)
        __IS_SAT__(r > 11, true);
    }
}

__test_symbolic__(__symbolic__('s', 6));
