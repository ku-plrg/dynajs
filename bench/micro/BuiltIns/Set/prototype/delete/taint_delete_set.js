// @type taint
// @target es6+ Set.prototype.delete
// @feature builtin set-delete

function __test_taint__(tainted) {
    // tainted = whole-tainted Set WITH elements (new Set(["x","y"]))
    var r = tainted.delete("x");
    // @witness always s.delete("x") returns boolean => clean
    __assert_taint__(r, false);
}

__test_taint__(__set_taint__(new Set(["x", "y"])));
