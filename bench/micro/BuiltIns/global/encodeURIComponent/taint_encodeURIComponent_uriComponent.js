// @type taint
// @target es5 encodeURIComponent
// @feature builtin encodeURIComponent

function __test_taint__(tainted) {
    // seed 'a b' => encodeURIComponent gives "a%20b" (5 chars)
    // 'a' -> 'a', ' ' -> '%20', 'b' -> 'b'; all chars derive from tainted input
    var r = encodeURIComponent(tainted);

    // @witness __test_taint__('x x') => r[0] = 'x' tainted
    __assert_taint__(r[0], true);

    // @witness '%' from encoding tainted space => r[1] = '%' tainted
    __assert_taint__(r[1], true);

    // @witness '2' from encoding tainted space => r[2] = '2' tainted
    __assert_taint__(r[2], true);

    // @witness '0' from encoding tainted space => r[3] = '0' tainted
    __assert_taint__(r[3], true);

    // @witness __test_taint__('x x') => r[4] = 'x' tainted
    __assert_taint__(r[4], true);
}

__test_taint__(__set_taint__('a b'));
