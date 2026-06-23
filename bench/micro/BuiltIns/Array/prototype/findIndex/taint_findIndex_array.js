// @type taint
// @target es6+ Array.prototype.findIndex
// @feature builtin array-findIndex

function __test_taint__(tainted) {
    // tainted = whole-tainted array WITH elements (["x","y","z"])
    // @witness always tainted.findIndex(v => v === "x") = 0, position (always clean)
    __assert_taint__(tainted.findIndex(function(v) { return v === "x"; }), false);
}

__test_taint__(__set_taint__(["x", "y", "z"]));
