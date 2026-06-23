// @type taint
// @target es5 Array.prototype.pop
// @feature builtin array-pop

function __test_taint__(tainted) {
    // tainted = whole-tainted array WITH elements (["x","y","z"])
    var r = tainted.pop();
    // @witness __test_taint__(["x","y","z"]) => r = "z" tainted (last existing element)
    __assert_taint__(r, true);
}

__test_taint__(__set_taint__(["x", "y", "z"]));
