// @type concolic
// @target es6+ Map.prototype.has
// @feature builtin has

function __test_symbolic__(symbolic) {
    const m = new Map();
    m.set(symbolic, 1);
    if (m.has(symbolic)) {
        // @witness set(symbolic) inserts the key, so has(symbolic) is guaranteed true (SameValueZero)
        __IS_SAT__(m.has(symbolic) === false, false);
    } else {
        __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 7));
