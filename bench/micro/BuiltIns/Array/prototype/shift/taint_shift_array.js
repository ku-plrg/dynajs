// @type taint
// @target es5 Array.prototype.shift
// @feature builtin array-shift
// @done

function __test_taint__(tainted) {
    var r = tainted.shift();
    // @witness __test_taint__(["x","x","x"]) => r = "x" tainted (first existing element)
    __assert_taint__(r, true);
}

__test_taint__(__set_taint__(["a", "b", "c"]));
