// @type taint
// @target es6+ String.fromCodePoint
// @feature builtin fromCodePoint
// @done

function __test_taint__(tainted) {
    var r = String.fromCodePoint(72, tainted);

    // @witness __test_taint__(120) => r[1]='x' (char content from tainted code point)
    __assert_taint__(r[1], true);
}

__test_taint__(__set_taint__(113));
