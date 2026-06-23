// @type taint
// @target es5 decodeURIComponent
// @feature builtin decodeURIComponent

function __test_taint__(tainted) {
    // tainted is 'a%20b'; decoded chars come from tainted input
    var r = decodeURIComponent(tainted);

    // @witness __test_taint__('a%20b') => r[0] = 'a' tainted
    __assert_taint__(r[0], true);

    // @witness __test_taint__('a%20b') => r[1] = ' ' tainted
    __assert_taint__(r[1], true);

    // @witness __test_taint__('a%20b') => r[2] = 'b' tainted
    __assert_taint__(r[2], true);
}

__test_taint__(__set_taint__('a%20b'));
