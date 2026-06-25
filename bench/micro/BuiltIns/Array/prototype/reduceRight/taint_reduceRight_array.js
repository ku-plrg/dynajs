// @type taint
// @target es5 Array.prototype.reduceRight
// @feature builtin array-reduceRight
// @done

function __test_taint__(tainted) {
    var r = tainted.reduceRight(function(acc, v) { return acc + v; }, "");
    // @witness __test_taint__(["x","x","x"]) => r = "xxx" tainted (accumulates tainted elements)
    __assert_taint__(r, true);
}

__test_taint__(__set_taint__(["a", "b", "c"]));
