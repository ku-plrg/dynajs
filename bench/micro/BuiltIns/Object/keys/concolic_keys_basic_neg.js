// @type concolic
// @target es5 Object.keys
// @feature builtin keys

function __test_symbolic__(symbolic) {
    if (Object.keys(symbolic).length >= 1) {
        // @witness __test_symbolic__({ a: 1 })
        __IS_SAT__(Object.keys(symbolic).length === 1, true);
    }
}

__test_symbolic__(__symbolic__('s', { a: 1 }));
