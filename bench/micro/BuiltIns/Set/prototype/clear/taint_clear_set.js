// @type taint
// @target es6+ Set.prototype.clear
// @feature builtin set-clear

function __test_taint__(tainted) {
    // tainted = whole-tainted Set WITH elements (new Set(["x","y"]))
    var r = tainted.clear();
    // @witness always s.clear() returns undefined => clean
    __assert_taint__(r, false);
}

__test_taint__(__set_taint__(new Set(["x", "y"])));
