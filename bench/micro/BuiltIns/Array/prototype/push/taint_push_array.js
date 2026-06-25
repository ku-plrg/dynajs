// @type taint
// @target es5 Array.prototype.push
// @feature builtin array-push
// @done

function __test_taint__(tainted) {
    var ret = tainted.push("q");
    // @witness always a[3] = "q", clean appended => clean
    __assert_taint__(tainted[3], false);
    // @witness __test_taint__(["x","x","x"]) => a[0] = "x" tainted
    __assert_taint__(tainted[0], true);
    // @witness array is still tainted
    __assert_taint__(tainted, true);
}

__test_taint__(__set_taint__(["a", "b", "c"]));
