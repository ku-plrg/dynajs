// @type taint
// @target es5 Array.prototype.toLocaleString
// @feature builtin array-toLocaleString
// @done

function __test_taint__(tainted) {
    var r = tainted.toLocaleString();
    // @witness __test_taint__(["x","x","x"]) => r[0] = 'x' tainted (first element char)
    __assert_taint__(r[0], true);
}

__test_taint__(__set_taint__(["a", "b", "c"]));
