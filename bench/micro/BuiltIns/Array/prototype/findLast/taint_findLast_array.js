// @type taint
// @target es6+ Array.prototype.findLast
// @feature builtin array-findLast

function __test_taint__(tainted) {
    // tainted = whole-tainted array WITH elements (["x","y","z"])
    // @witness __test_taint__(["x","y","z"]) => tainted.findLast(() => true) = "z" tainted
    __assert_taint__(tainted.findLast(function() { return true; }), true);
}

__test_taint__(__set_taint__(["x", "y", "z"]));
