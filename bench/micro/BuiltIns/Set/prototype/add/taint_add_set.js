// @type taint
// @target es6+ Set.prototype.add
// @feature builtin set-add
// @done

function __test_taint__(tainted) {


    tainted.add("z");
    // @witness __test_taint__(new Set(["x"])) => tainted = whole tainted set still tainted
    __assert_taint__(tainted, true);

}

__test_taint__(__set_taint__(new Set(["a", "b"])));
