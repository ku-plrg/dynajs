// @type taint
// @target es5 Array.prototype.toString
// @feature builtin array-toString
// @done

function __test_taint__(tainted) {
    var r = tainted.toString();
    // @witness __test_taint__(["x","x","x"]) => r[0] = 'x' tainted (first element char)
    __assert_taint__(r[0], true);
}

__test_taint__(__set_taint__(["a", "b", "c"]));
