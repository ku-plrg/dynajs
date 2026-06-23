// @type taint
// @target es6+ Array.prototype.reduceRight
// @feature builtin array-reduceRight

function __test_taint__(tainted) {
    var a = ["a", "b", "c"];
    var r = a.reduceRight(function (acc, v) { return acc + v; }, tainted);
    // @witness reduceRight seeds the accumulator with tainted "x" => tainted
    __assert_taint__(r, true);
}

__test_taint__(__set_taint__("hello"));
