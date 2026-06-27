// @type taint
// @target es5 unescape
// @feature builtin unescape

function __test_taint__(tainted) {
    // tainted is '%61%62' (escaped form of 'ab'); decoded chars derive from tainted input
    var r = unescape(tainted);

    // @witness decoded char from tainted %-escape => r[0] = 'x' tainted
    __assert_taint__(r[0], true);

    // @witness decoded char from tainted %-escape => r[1] = 'x' tainted
    __assert_taint__(r[1], true);
}

__test_taint__(__set_taint__('%61%62'));
