// @type concolic
// @target es5 String.fromCharCode
// @feature builtin fromCharCode

function __test_symbolic__(symbolic) {
    var r = String.fromCharCode(symbolic);
    if (r >= 'a' && r <= 'z') {
        // @witness lowercase guard pins fromCharCode(symbolic) to codes 97..122
        __IS_SAT__(!(symbolic >= 97 && symbolic <= 122), false);
    }
}

__test_symbolic__(__symbolic__('s', 113));
