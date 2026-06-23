// @type taint
// @target es6+ Set.prototype.entries
// @feature builtin set-entries

function __test_taint__(tainted) {
    // tainted = whole-tainted Set WITH elements (new Set(["x","y"]))
    var e = Array.from(tainted.entries())[0];
    // @witness __test_taint__(new Set(["x","y"])) => e[0] = "x" tainted (Set entry key equals value)
    __assert_taint__(e[0], true);
}

__test_taint__(__set_taint__(new Set(["x", "y"])));
