// @type concolic
// @target es6+ Map.prototype.has
// @feature builtin has

function __test_symbolic__(symbolic) {
    const m = new Map();
    m.set(10, "a");
    m.set(20, "b");
    if (symbolic > 0) {
        // @witness __test_symbolic__(10)
        __IS_SAT__(m.has(symbolic) === true, true);
    }
}

__test_symbolic__(__symbolic__('s', 15));
