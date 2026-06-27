// @type taint
// @target es5 decodeURI
// @feature builtin decodeURI

function __test_taint__(tainted) {
    // tainted is 'hello%20world'; decoded chars come from tainted input
    var r = decodeURI(tainted);

    // @witness decoded char derives from tainted input => r[0] = 'x' tainted
    __assert_taint__(r[0], true);

    // @witness decoded space from tainted '%20' => r[5] = ' ' tainted
    __assert_taint__(r[5], true);
}

__test_taint__(__set_taint__('hello%20world'));
