// @type taint
// @target es6+ Array.prototype.flatMap
// @feature builtin array-flatMap

function __test_taint__(tainted) {
    var a = [tainted, "b", "c"];
    var r = a.flatMap(function (v) { return [v]; });
    // @witness flatMap preserves tainted "x" at [0]
    __assert_taint__(r[0], true);
    __assert_taint__(r[1], false);
    __assert_taint__(r[2], false);
}

__test_taint__(__set_taint__("hello"));
