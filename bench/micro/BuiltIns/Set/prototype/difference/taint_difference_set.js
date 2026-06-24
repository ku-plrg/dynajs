// @type taint
// @target es6+ Set.prototype.difference
// @feature builtin set-difference

function __test_taint__(tainted) {
    // tainted = whole-tainted Set WITH elements (new Set(["x","y"]))
    var r = tainted.difference(new Set(["y"]));
    var a = Array.from(r);
    // @witness __test_taint__(new Set(["x","y"])) => Array.from(r)[0] = "x" tainted
    __assert_taint__(a[0], true);
    // @witness every surviving element comes from the tainted this => whole tainted
    __assert_taint__(r, true);
}

__test_taint__(__set_taint__(new Set(["x", "y"])));
