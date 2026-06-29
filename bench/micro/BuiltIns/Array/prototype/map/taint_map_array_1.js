// @type taint
// @target es5 Array.prototype.map
// @feature builtin array-map
// @done

function __test_taint__(tainted) {
    var r = tainted.map(function(v) { return v; });
    // @witness __test_taint__(["x","x","x"]) => r[0] = "x" tainted
    __assert_taint__(r[0], true);
}

__test_taint__(__set_taint__(["a", "b", "c"]));
