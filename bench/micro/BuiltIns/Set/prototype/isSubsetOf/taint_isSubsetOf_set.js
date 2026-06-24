// @type taint
// @target es6+ Set.prototype.isSubsetOf
// @feature builtin set-isSubsetOf

function __test_taint__(tainted) {
    // tainted = whole-tainted Set WITH elements (new Set(["x","y"]))
    var r = tainted.isSubsetOf(new Set(["x", "y", "z"]));
    // @witness boolean result, clean
    __assert_taint__(r, false);
}

__test_taint__(__set_taint__(new Set(["x", "y"])));
