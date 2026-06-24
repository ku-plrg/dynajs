// @type concolic
// @target es6+ Map.prototype.set
// @feature builtin set

function __test_symbolic__(symbolic) {
    var m = new Map();
    if (symbolic > 5) {
        m.set("k", symbolic);
        // @witness set of a fresh key on an empty Map always raises size to exactly 1, never 0
        __IS_SAT__(m.size === 0, false);
    } else {
        __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 8));
