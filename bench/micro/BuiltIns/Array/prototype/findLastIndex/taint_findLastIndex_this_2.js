// @type taint
// @target es6+ Array.prototype.findLastIndex
// @feature builtin array-findLastIndex
// @done

function __test_taint__(tainted) {
    var a = ["a", "b", tainted];
    // @witness findLastIndex returns -1 (not found), clean
    __assert_taint__(a.findLastIndex(function (v) { return v === "z"; }), false);
}

__test_taint__(__set_taint__("hello"));
