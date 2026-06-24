// @type taint
// @target es6+ Set.prototype.size
// @feature builtin set-size
// @done

function __test_taint__(tainted) {

    // @witness __test_taint__(new Set(["x","y","z","w"])) => r = 4
    __assert_taint__(tainted.size, true);
}

__test_taint__(__set_taint__(new Set(["x", "y"])));
