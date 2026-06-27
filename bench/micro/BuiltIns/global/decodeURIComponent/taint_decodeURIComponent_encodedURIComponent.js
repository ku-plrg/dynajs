// @type taint
// @target es5 decodeURIComponent
// @feature builtin decodeURIComponent

function __test_taint__(tainted) {
    // tainted is 'a%20b'; decoded chars come from tainted input
    var r = decodeURIComponent(tainted);

    // @witness decoded char from tainted input => r[0] = 'x' tainted
    __assert_taint__(r[0], true);

    // @witness decoded space from tainted '%20' => r[1] = ' ' tainted
    __assert_taint__(r[1], true);

    // @witness decoded char from tainted input => r[2] = 'x' tainted
    __assert_taint__(r[2], true);
}

__test_taint__(__set_taint__('a%20b'));
