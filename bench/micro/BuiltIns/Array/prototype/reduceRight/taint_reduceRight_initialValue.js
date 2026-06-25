// @type taint
// @target es6+ Array.prototype.reduceRight
// @feature builtin array-reduceRight
// @done

function __test_taint__(tainted) {
    var a = ["a", "b", "c"];
    var r = a.reduceRight(function (acc, v) { return acc + v; }, tainted);
    // @witness __test_taint__('x') => r[0] = 'x' tainted
    __assert_taint__(r[0], true);
}

__test_taint__(__set_taint__("hello"));
