// @type concolic
// @target es5 Array.length
// @feature builtin length

function __test_symbolic__(symbolic) {
    if (symbolic.length === 1) {
        symbolic.push(7);
        // @witness one push raises length to 2, so it can never stay <= 1
        __IS_SAT__(symbolic.length <= 1, false);
    } else {
        __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', [5]));
