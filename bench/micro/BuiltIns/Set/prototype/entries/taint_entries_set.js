// @type taint
// @target es6+ Set.prototype.entries
// @feature builtin set-entries
// @done

function __test_taint__(tainted) {

    var e = Array.from(tainted.entries())[0];
    // @witness __test_taint__(new Set(["x","y"])) => e[0] = "x"
    __assert_taint__(e[0], true);
}

__test_taint__(__set_taint__(new Set(["a", "b"])));
