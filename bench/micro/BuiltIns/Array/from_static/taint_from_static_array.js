// @type taint
// @target es6+ Array.from
// @feature builtin array-from_static

function __test_taint__(tainted) {
    // tainted = whole-tainted array WITH elements (["x","y","z"])
    var r = Array.from(tainted);
    // @witness __test_taint__(["x","y","z"]) => r[0] = "x" tainted (element from tainted iterable)
    __assert_taint__(r[0], true);
}

__test_taint__(__set_taint__(["x", "y", "z"]));
