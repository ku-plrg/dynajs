// @type taint
// @target es5 Array.prototype.pop
// @feature builtin array-pop
// @done

function __test_taint__(tainted) {
    var r = tainted.pop();
    // @witness __test_taint__(["x","x","x"]) => r = "x" tainted (last existing element)
    __assert_taint__(r, true);
}

__test_taint__(__set_taint__(["a", "b", "c"]));
