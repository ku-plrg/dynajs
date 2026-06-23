// @type taint
// @target es6+ Set.prototype.has
// @feature builtin set-has

function __test_taint__(tainted) {
    // tainted = whole-tainted Set WITH elements (new Set(["x","y"]))
    var r = tainted.has("x");
    // @witness always s.has("x") returns boolean => clean
    __assert_taint__(r, false);
}

__test_taint__(__set_taint__(new Set(["x", "y"])));
