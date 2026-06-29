// @type taint
// @target es5 Array.prototype.indexOf
// @feature builtin array-indexOf
// @done

function __test_taint__(tainted) {
    var r1 = tainted.indexOf("a");
    var r2 = tainted.indexOf("zzz");
    // @witness always indexOf("zzz") = -1, not-found position => clean
    __assert_taint__(r2, false);
}

__test_taint__(__set_taint__(["a", "b", "c"]));
