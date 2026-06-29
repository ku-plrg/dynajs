// @type taint
// @target es5 Array.prototype.indexOf
// @feature builtin array-indexOf
// @done

function __test_taint__(tainted) {
    var r1 = tainted.indexOf("a");
    // @witness always indexOf returns position number => clean
    __assert_taint__(r1, false);
}

__test_taint__(__set_taint__(["a", "b", "c"]));
