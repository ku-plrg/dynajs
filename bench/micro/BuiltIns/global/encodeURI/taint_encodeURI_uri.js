// @type taint
// @target es5 encodeURI
// @feature builtin encodeURI

function __test_taint__(tainted) {
    var r = encodeURI('a' + tainted);

    // @witness always r[0]='a' (clean prefix)
    __assert_taint__(r[0], false);

    // @witness __test_taint__('b') => r[1]='b' (tainted content char)
    __assert_taint__(r[1], true);
}

__test_taint__(__set_taint__('hello'));
