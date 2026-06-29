// @type taint
// @target es6+ Array.prototype.some
// @feature builtin array-some
// @done

function __test_taint__(tainted) {
    var a = [tainted, "b", "c"];
    // @witness boolean result, clean
    __assert_taint__(a.some(function (v) { return v === "z"; }), false);
}

__test_taint__(__set_taint__("hello"));
