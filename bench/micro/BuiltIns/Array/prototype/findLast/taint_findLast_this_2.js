// @type taint
// @target es6+ Array.prototype.findLast
// @feature builtin array-findLast
// @done

function __test_taint__(tainted) {
    var a = ["a", "b", tainted];
    // @witness findLast returns undefined (not found), clean
    __assert_taint__(a.findLast(function (v) { return v === "z"; }), false);
}

__test_taint__(__set_taint__("hello"));
