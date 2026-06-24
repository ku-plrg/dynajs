// @type taint
// @target es6+ Set.prototype.union
// @feature builtin set-union

function __test_taint__(tainted) {
    // tainted = whole-tainted Set WITH elements (new Set(["x","y"]))
    var r = tainted.union(new Set(["z"]));
    var a = Array.from(r);
    // @witness __test_taint__(new Set(["x","y"])) => Array.from(r)[0] = "x" tainted (from tainted this)
    __assert_taint__(a[0], true);
    // @witness "z" from clean other operand, clean
    __assert_taint__(a[2], false);
    // @witness mixed (tainted this + clean other) => not all-tainted, clean
    __assert_taint__(r, false);
}

__test_taint__(__set_taint__(new Set(["x", "y"])));
