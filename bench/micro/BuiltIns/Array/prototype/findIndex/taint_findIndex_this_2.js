// @type taint
// @target es6+ Array.prototype.findIndex
// @feature builtin array-findIndex
// @done

function __test_taint__(tainted) {
    var a = [tainted, "b", "c"];
    // @witness findIndex returns -1 (not found), clean
    __assert_taint__(a.findIndex(function (v) { return v === "z"; }), false);
}

__test_taint__(__set_taint__("hello"));
