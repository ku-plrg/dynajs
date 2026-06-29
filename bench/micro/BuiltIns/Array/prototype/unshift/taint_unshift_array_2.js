// @type taint
// @target es5 Array.prototype.unshift
// @feature builtin array-unshift

function __test_taint__(tainted) {
    var ret = tainted.unshift("q");
    // @witness __test_taint__(["x","x","x"]) => tainted[1] = "x" tainted (shifted element)
    __assert_taint__(tainted[1], true);
}

__test_taint__(__set_taint__(["a", "b", "c"]));
