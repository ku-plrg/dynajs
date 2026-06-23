// @type taint
// @target es6+ Array.prototype.find
// @feature builtin array-find

function __test_taint__(tainted) {
    // tainted = whole-tainted array WITH elements (["x","y","z"])
    // @witness __test_taint__(["x","y","z"]) => tainted.find(v => v === "x") = "x" tainted
    __assert_taint__(tainted.find(function(v) { return v === "x"; }), true);
    // @witness always tainted.find(() => false) = undefined (not-found), clean
    __assert_taint__(tainted.find(function() { return false; }), false);
}

__test_taint__(__set_taint__(["x", "y", "z"]));
