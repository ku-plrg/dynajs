// @type concolic
// @target es5 JSON.parse
// @feature builtin parse
// @done

function __test_symbolic__(symbolic) {
    if (JSON.parse(symbolic).a !== undefined && typeof symbolic === 'string') {
        // @witness string symbolic must contain "a"
        __IS_SAT__(!symbolic.includes("a"), false);
    } else {
        __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', '{"a":1}'));
