// @type taint
// @target es5 Array.prototype.unshift
// @feature builtin array-unshift

function __test_taint__(tainted) {
    // tainted = whole-tainted array WITH elements (["x","y","z"])
    var ret = tainted.unshift("q");
    // @witness always tainted[0] = "q" clean prepended literal
    __assert_taint__(tainted[0], false);
    // @witness __test_taint__(["x","y","z"]) => tainted[1] = "x" tainted (shifted element)
    __assert_taint__(tainted[1], true);
    // @witness __test_taint__(["x","y","z"]) => ret = 4 tainted (length count)
    __assert_taint__(ret, true);
}

__test_taint__(__set_taint__(["x", "y", "z"]));
