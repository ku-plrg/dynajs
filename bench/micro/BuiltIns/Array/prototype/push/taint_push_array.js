// @type taint
// @target es5 Array.prototype.push
// @feature builtin array-push

function __test_taint__(tainted) {
    // tainted = whole-tainted array WITH elements (["x","y","z"])
    var ret = tainted.push("q");
    // @witness always a[3] = "q", clean appended => clean
    __assert_taint__(tainted[3], false);
    // @witness __test_taint__(["x","y","z"]) => a[0] = "x" tainted
    __assert_taint__(tainted[0], true);
    // @witness __test_taint__(["x","y","z"]) => ret = 4 (length count) tainted
    __assert_taint__(ret, true);
}

__test_taint__(__set_taint__(["x", "y", "z"]));
