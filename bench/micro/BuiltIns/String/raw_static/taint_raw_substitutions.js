// @type taint
// @target es6+ String.raw
// @feature builtin raw-static
// @done

function __test_taint__(tainted) {
    var r = String.raw`ab${tainted}cd`;

    // @witness always r[0]='a' from literal template
    __assert_taint__(r[0], false);

    // @witness always r[1]='b' from literal template
    __assert_taint__(r[1], false);

    // @witness __test_taint__('x') => r[2]='x' from tainted substitution
    __assert_taint__(r[2], true);

    // @witness always r[r.length-1]='d' clean suffix from literal template
    __assert_taint__(r[r.length-1], false);
}

__test_taint__(__set_taint__('hello'));
