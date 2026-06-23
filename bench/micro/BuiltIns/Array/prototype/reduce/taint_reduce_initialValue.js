// @type taint
// @target es6+ Array.prototype.reduce
// @feature builtin array-reduce

function __test_taint__(tainted) {
    var a = ["a", "b", "c"];
    var r = a.reduce(function (acc, v) { return acc + v; }, tainted);
    // @witness reduce seeds the accumulator with tainted "x" => tainted
    __assert_taint__(r, true);
}

__test_taint__(__set_taint__("hello"));
