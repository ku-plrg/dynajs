// @type concolic
// @target es5 global.encodeURI
// @feature builtin encodeuri

function __test_symbolic__(symbolic) {
    var result = encodeURI(symbolic);
    if (result.length >= symbolic.length) {
        // @witness encodeURI maps each char to itself or a longer %XX escape, so it never shrinks the input
        __IS_SAT__(result.length < symbolic.length, false);
    } else {
        __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', "a b"));
