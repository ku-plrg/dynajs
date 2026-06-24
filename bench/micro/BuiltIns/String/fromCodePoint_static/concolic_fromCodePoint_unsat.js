// @type concolic
// @target es6+ String.fromCodePoint
// @feature builtin fromCodePoint

function __test_symbolic__(symbolic) {
    var r = String.fromCodePoint(symbolic);
    if (r >= 'a' && r <= 'z') {
        // @witness the lowercase-result guard pins the code point into [97,122]
        __IS_SAT__(!(symbolic >= 97 && symbolic <= 122), false);
    }
}

__test_symbolic__(__symbolic__('s', 113));
