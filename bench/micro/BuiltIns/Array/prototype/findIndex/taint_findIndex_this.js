// @type taint
// @target es6+ Array.prototype.findIndex
// @feature builtin array-findIndex

function __test_taint__(tainted) {
    var a = [tainted, "b", "c"];
    // @witness __test_taint__('hello') => a.findIndex(v==='hello') = 0 tainted
    __assert_taint__(a.findIndex(function (v) { return v === "hello"; }), true);
    // @witness index/position, not content => clean
    __assert_taint__(a.findIndex(function (v) { return v === "b"; }), false);
    // @witness index/position, not content => clean
    __assert_taint__(a.findIndex(function (v) { return v === "c"; }), false);
    // @witness findIndex returns -1 (not found), clean
    __assert_taint__(a.findIndex(function (v) { return v === "z"; }), false);
}

__test_taint__(__set_taint__("hello"));
