// @type taint
// @target es5 Array.prototype.toString
// @feature builtin array-toString

function __test_taint__(tainted) {
    // tainted = whole-tainted array WITH elements (["x","y","z"])
    var r = tainted.toString();
    // @witness __test_taint__(["x","y","z"]) => r[0] = 'x' tainted (first element char)
    __assert_taint__(r[0], true);
    // @witness always r[1] = ',' comma separator, clean
    __assert_taint__(r[1], false);
}

__test_taint__(__set_taint__(["x", "y", "z"]));
