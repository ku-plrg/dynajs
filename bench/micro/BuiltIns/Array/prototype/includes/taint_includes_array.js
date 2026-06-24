// @type taint
// @target es6+ Array.prototype.includes
// @feature builtin array-includes

function __test_taint__(tainted) {
    // tainted = whole-tainted array WITH elements (["x","y","z"])
    var r = tainted.includes("x");
    // @witness always a.includes("x") returns boolean => clean
    __assert_taint__(r, false);
}

__test_taint__(__set_taint__(["x", "y", "z"]));
