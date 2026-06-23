// @type taint
// @target es6+ Array.prototype.findLastIndex
// @feature builtin array-findLastIndex

function __test_taint__(tainted) {
    var a = ["a", "b", tainted];
    // @witness __test_taint__('hello') => a.findLastIndex(v==='hello') = 2 tainted
    __assert_taint__(a.findLastIndex(function (v) { return v === "hello"; }), true);
    // @witness index/position, not content => clean
    __assert_taint__(a.findLastIndex(function (v) { return v === "b"; }), false);
    // @witness index/position, not content => clean
    __assert_taint__(a.findLastIndex(function (v) { return v === "a"; }), false);
    // @witness findLastIndex returns -1 (not found), clean
    __assert_taint__(a.findLastIndex(function (v) { return v === "z"; }), false);
}

__test_taint__(__set_taint__("hello"));
