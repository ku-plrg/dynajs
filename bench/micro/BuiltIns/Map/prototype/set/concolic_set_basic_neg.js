// @type concolic
// @target es6+ Map.prototype.set
// @feature builtin set

function __test_symbolic__(symbolic) {
    if (symbolic > 5) {
        var m = new Map();
        m.set("x", symbolic);
        // @witness __test_symbolic__(150)
        __IS_SAT__(m.get("x") > 100, true);
    }
}

__test_symbolic__(__symbolic__('s', 8));
