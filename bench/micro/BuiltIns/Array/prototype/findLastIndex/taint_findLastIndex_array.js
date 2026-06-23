// @type taint
// @target es6+ Array.prototype.findLastIndex
// @feature builtin array-findLastIndex

function __test_taint__(tainted) {
    // tainted = whole-tainted array WITH elements (["x","y","z"])
    // @witness always tainted.findLastIndex(() => true) = 2, position (always clean)
    __assert_taint__(tainted.findLastIndex(function() { return true; }), false);
}

__test_taint__(__set_taint__(["x", "y", "z"]));
