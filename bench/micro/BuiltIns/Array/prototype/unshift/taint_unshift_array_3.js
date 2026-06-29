// @type taint
// @target es5 Array.prototype.unshift
// @feature builtin array-unshift

function __test_taint__(tainted) {
    var ret = tainted.unshift("q");
    // @witness __test_taint__(["x","x","x"]) => ret = 4 tainted (length count)
    __assert_taint__(ret, true);
}

__test_taint__(__set_taint__(["a", "b", "c"]));
