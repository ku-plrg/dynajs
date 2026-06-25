// @type taint
// @target es6+ Array.prototype.findIndex
// @feature builtin array-findIndex
// @done

function __test_taint__(tainted) {
    // @witness always tainted.findIndex(v => v === "x") = 0, position (always clean)
    __assert_taint__(tainted.findIndex(function(v) { return v === "a"; }), false);
}

__test_taint__(__set_taint__(["a", "b", "c"]));
