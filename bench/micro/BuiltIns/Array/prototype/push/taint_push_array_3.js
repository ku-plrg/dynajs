// @type taint
// @target es5 Array.prototype.push
// @feature builtin array-push
// @done

function __test_taint__(tainted) {
    var ret = tainted.push("q");
    // @witness array is still tainted
    __assert_taint__(tainted, true);
}

__test_taint__(__set_taint__(["a", "b", "c"]));
