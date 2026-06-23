// @type taint
// @target es5 unescape
// @feature builtin unescape

function __test_taint__(tainted) {
    // tainted is '%61%62' (escaped form of 'ab'); decoded chars derive from tainted input
    var r = unescape(tainted);

    // @witness __test_taint__('%61%62') => r[0]='a' (decoded from tainted input)
    __assert_taint__(r[0], true);

    // @witness __test_taint__('%61%62') => r[1]='b' (decoded from tainted input)
    __assert_taint__(r[1], true);
}

__test_taint__(__set_taint__('%61%62'));
