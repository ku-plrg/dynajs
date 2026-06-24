// @type taint
// @target es6+ Set.prototype.delete
// @feature builtin set-delete
// @done

function __test_taint__(tainted) {

    var r = tainted.delete("a");
    // @witness always s.delete("x") returns boolean => clean
    __assert_taint__(r, false);

    // @witness __test_taint__(new Set(["x"]))
    __assert_taint__(tainted, true);

}

__test_taint__(__set_taint__(new Set(["a", "b"])));
