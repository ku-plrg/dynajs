// @type taint
// @target es6+ String.raw
// @feature builtin raw-static
// @done

function __test_taint__(tainted) {
    var r = String.raw`ab${tainted}cd`;

    // @witness __test_taint__('x') => r[2]='x' from tainted substitution
    __assert_taint__(r[2], true);
}

__test_taint__(__set_taint__('hello'));
