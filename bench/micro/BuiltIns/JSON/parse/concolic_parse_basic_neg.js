// @type concolic
// @target es5 JSON.parse
// @feature builtin parse
// @done

function __test_symbolic__(symbolic) {
    if (JSON.parse(symbolic) === 1) {
        // @witness __test_symbolic__("1")
        __IS_SAT__(symbolic !== 1, true);
    } else {
        __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', '1'));
