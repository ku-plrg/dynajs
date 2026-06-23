// @type concolic
// @target es5 Function.prototype.call
// @feature builtin call

function __test_symbolic__(symbolic) {
    function addTen(x) {
        return x + 10;
    }
    if (symbolic > 5) {
        var r = addTen.call(null, symbolic);
        // @witness the symbolic>5 guard plus +10 forces r>15, so r<=15 is impossible
        __IS_SAT__(r <= 15, false);
    } else {
        __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 6));
