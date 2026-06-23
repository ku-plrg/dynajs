// @type taint
// @target es6+ Array.prototype.findIndex
// @feature builtin array-findIndex

function __test_taint__(tainted) {
    var a = [tainted, "b", "c"];
    // @witness findIndex locating tainted "x" yields a tainted index
    __assert_taint__(a.findIndex(function (v) { return v === "hello"; }), true);
    __assert_taint__(a.findIndex(function (v) { return v === "b"; }), false);
    __assert_taint__(a.findIndex(function (v) { return v === "c"; }), false);
    __assert_taint__(a.findIndex(function (v) { return v === "z"; }), false);
}

__test_taint__(__set_taint__("hello"));
