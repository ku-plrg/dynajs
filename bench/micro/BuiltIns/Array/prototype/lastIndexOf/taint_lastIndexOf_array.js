// @type taint
// @target es5 Array.prototype.lastIndexOf
// @feature builtin array-lastIndexOf

function __test_taint__(tainted) {
    // tainted = whole-tainted array WITH elements (["x","y","z"])
    var r = tainted.lastIndexOf("x");
    // @witness always lastIndexOf returns position number => clean
    __assert_taint__(r, false);
}

__test_taint__(__set_taint__(["x", "y", "z"]));
