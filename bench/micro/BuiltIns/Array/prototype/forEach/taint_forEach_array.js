// @type taint
// @target es6+ Array.prototype.forEach
// @feature builtin array-forEach
// @done

function __test_taint__(tainted) {
    var g;
    tainted.forEach(function(v) { g = v; });
    // @witness __test_taint__(["x","x","x"]) => g = "x" tainted (last element assigned)
    __assert_taint__(g, true);
}

__test_taint__(__set_taint__(["a", "b", "c"]));
