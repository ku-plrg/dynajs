// @type taint
// @target es6+ Array.prototype.find
// @feature builtin array-find
// @done

function __test_taint__(tainted) {
    var a = [tainted, "b", "c"];
    // @witness find returns undefined (not found), clean
    __assert_taint__(a.find(function (v) { return v === "z"; }), false);
}

__test_taint__(__set_taint__("hello"));
