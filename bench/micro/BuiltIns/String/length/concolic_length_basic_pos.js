// @type concolic
// @target es5 String length
// @feature builtin length

function __test_symbolic__(symbolic) {
    if (symbolic.length >= 3) {
        // @witness the length>=3 guard leaves no room below 3
        __IS_SAT__(symbolic.length <= 2, false);
    }
}

__test_symbolic__(__symbolic__('s', "hello"));
