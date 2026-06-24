// @type concolic
// @target es5 Number.prototype.toFixed
// @feature builtin tofixed

function __test_symbolic__(symbolic) {
    if (symbolic > 0) {
        // @witness __test_symbolic__(3.14159)
        __IS_SAT__(symbolic.toFixed(2).indexOf(".") !== -1, true);
    }
}

__test_symbolic__(__symbolic__('s', 3.14159));
