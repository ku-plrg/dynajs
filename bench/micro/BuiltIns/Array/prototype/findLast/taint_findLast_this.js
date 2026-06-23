// @type taint
// @target es6+ Array.prototype.findLast
// @feature builtin array-findLast

function __test_taint__(tainted) {
    var a = ["a", "b", tainted];
    // @witness findLast returns the tainted element "x"
    __assert_taint__(a.findLast(function (v) { return v === "hello"; }), true);
    // @witness findLast returns a clean element
    __assert_taint__(a.findLast(function (v) { return v === "b"; }), false);
    // @witness findLast returns undefined => clean
    __assert_taint__(a.findLast(function (v) { return v === "z"; }), false);
}

__test_taint__(__set_taint__("hello"));
