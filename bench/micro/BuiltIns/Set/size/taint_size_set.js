// @type taint
// @target es6+ Set.prototype.size
// @feature builtin set-size

function __test_taint__(tainted) {
    // tainted = whole-tainted Set WITH elements (new Set(["x","y"]))
    var r = tainted.size;
    // @witness __test_taint__(new Set(["x","y"])) => r = 2 tainted (count derived from tainted container)
    __assert_taint__(r, true);
}

__test_taint__(__set_taint__(new Set(["x", "y"])));
