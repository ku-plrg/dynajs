// @type taint
// @target es6+ String.fromCodePoint
// @feature builtin fromCodePoint
// @done

function __test_taint__(tainted) {
    var r = String.fromCodePoint(72, tainted);

    // @witness always r[0]='H' (from clean code point 72)
    __assert_taint__(r[0], false);
}

__test_taint__(__set_taint__(113));
