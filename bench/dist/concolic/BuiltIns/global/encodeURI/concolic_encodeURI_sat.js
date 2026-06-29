// @type concolic
// @target es5 global.encodeURI
// @feature builtin encodeuri

function __test_symbolic__(symbolic) {
    if (symbolic.indexOf(" ") !== -1) {
        var result = encodeURI(symbolic);
        // @witness __test_symbolic__("a b")
        __IS_SAT__(result.length > symbolic.length, true);
    }
}

__test_symbolic__(__symbolic__('s', "a b"));
