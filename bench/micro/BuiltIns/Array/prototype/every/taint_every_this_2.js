// @type taint
// @target es6+ Array.prototype.every
// @feature builtin array-every
// @done

function __test_taint__(tainted) {
    var a = [tainted, "b", "c"];
    // @witness every() returns a boolean => clean
    __assert_taint__(a.every(function (v) { return v === "hello"; }), false);
}

__test_taint__(__set_taint__("hello"));
