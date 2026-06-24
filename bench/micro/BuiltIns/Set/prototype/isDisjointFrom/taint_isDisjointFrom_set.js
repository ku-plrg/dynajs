// @type taint
// @target es6+ Set.prototype.isDisjointFrom
// @feature builtin set-isDisjointFrom

function __test_taint__(tainted) {
    // tainted = whole-tainted Set WITH elements (new Set(["x","y"]))
    var r = tainted.isDisjointFrom(new Set(["w"]));
    // @witness boolean result, clean
    __assert_taint__(r, false);
}

__test_taint__(__set_taint__(new Set(["x", "y"])));
