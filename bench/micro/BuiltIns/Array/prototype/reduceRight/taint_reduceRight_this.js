// @type taint
// @target es6+ Array.prototype.reduceRight
// @feature builtin array-reduceRight

function __test_taint__(tainted) {
    var a = ["a", tainted, "c"];
    var r = a.reduceRight(function (acc, v) { return acc + v; });
    // @witness __test_taint__('x') => r contains 'x', tainted
    __assert_taint__(r, true);
}

__test_taint__(__set_taint__("hello"));
