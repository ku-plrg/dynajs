// @type taint
// @target es5 Array.prototype.reduce
// @feature builtin array-reduce
// @done

function __test_taint__(tainted) {
    var r = tainted.reduce(function(acc, v) { return acc + v; }, "");
    // @witness __test_taint__(["x","x","x"]) => r = "xxx" tainted (accumulates tainted elements)
    __assert_taint__(r, true);
}

__test_taint__(__set_taint__(["a", "b", "c"]));
