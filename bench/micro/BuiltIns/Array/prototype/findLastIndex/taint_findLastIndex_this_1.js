// @type taint
// @target es6+ Array.prototype.findLastIndex
// @feature builtin array-findLastIndex
// @done

function __test_taint__(tainted) {
    var a = ["a", "b", tainted];
    // @witness index/position, not content => clean
    __assert_taint__(a.findLastIndex(function (v) { return v === "b"; }), false);
}

__test_taint__(__set_taint__("hello"));
