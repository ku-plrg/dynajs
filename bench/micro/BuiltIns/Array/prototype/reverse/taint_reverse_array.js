// @type taint
// @target es5 Array.prototype.reverse
// @feature builtin array-reverse

function __test_taint__(tainted) {
    // tainted = whole-tainted array WITH elements (["x","y","z"])
    var r = tainted.reverse();
    // @witness __test_taint__(["x","y","z"]) => r[0] = "z" tainted
    __assert_taint__(r[0], true);
}

__test_taint__(__set_taint__(["x", "y", "z"]));
