// @type taint
// @target es5 decodeURI
// @feature builtin decodeURI

function __test_taint__(tainted) {
    // tainted is 'hello%20world'; decoded chars come from tainted input
    var r = decodeURI(tainted);

    // @witness __test_taint__('hello%20world') => r[0]='h' (tainted content)
    __assert_taint__(r[0], true);

    // @witness __test_taint__('hello%20world') => r[5]=' ' (decoded from tainted %20)
    __assert_taint__(r[5], true);
}

__test_taint__(__set_taint__('hello%20world'));
