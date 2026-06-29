// @type taint
// @target es5 Array.prototype.pop
// @feature builtin array-pop
// @done

function __test_taint__(tainted) {
    var r = tainted.pop();
    // @witness array is still tainted
    __assert_taint__(tainted, true);
}

__test_taint__(__set_taint__(["a", "b", "c"]));
