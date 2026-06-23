// @type taint
// @target es5 Array.prototype.shift
// @feature builtin array-shift

function __test_taint__(tainted) {
    // tainted = whole-tainted array WITH elements (["x","y","z"])
    var r = tainted.shift();
    // @witness __test_taint__(["x","y","z"]) => r = "x" tainted (first existing element)
    __assert_taint__(r, true);
}

__test_taint__(__set_taint__(["x", "y", "z"]));
