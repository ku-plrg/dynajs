// @type taint
// @target es6+ Array.prototype.every
// @feature builtin array-every
// @done

function __test_taint__(tainted) {
    var a = [tainted, "b", "c"];
    // @witness every() returns a boolean => clean even with tainted "x"
    __assert_taint__(a.every(function (v) { return typeof v === "string"; }), false);
}

__test_taint__(__set_taint__("hello"));
