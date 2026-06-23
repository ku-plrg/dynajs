// @type taint
// @target es6+ Array.prototype.findLastIndex
// @feature builtin array-findLastIndex

function __test_taint__(tainted) {
    var a = ["a", "b", tainted];
    // @witness findLastIndex locating tainted "x" yields a tainted index
    __assert_taint__(a.findLastIndex(function (v) { return v === "hello"; }), true);
    __assert_taint__(a.findLastIndex(function (v) { return v === "b"; }), false);
    __assert_taint__(a.findLastIndex(function (v) { return v === "a"; }), false);
    __assert_taint__(a.findLastIndex(function (v) { return v === "z"; }), false);
}

__test_taint__(__set_taint__("hello"));
